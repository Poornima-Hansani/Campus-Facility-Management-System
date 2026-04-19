const express = require('express');
const router = express.Router();
const StudyArea = require('../models/StudyArea');
const LabBooking = require('../models/LabBooking');
const TimetableSession = require('../models/TimetableSession');

function toMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function toTimeStr(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}


router.post('/study-areas', async (req, res) => {
  try {
    const { name, location, capacity, description, amenities } = req.body;
    if (!name || !location) {
      return res.status(400).json({ message: 'Name and location are required' });
    }
    const area = await StudyArea.create({
      name,
      location,
      capacity: capacity || 30,
      description: description || '',
      amenities: amenities || []
    });
    res.status(201).json(area);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/study-areas', async (req, res) => {
  try {
    const areas = await StudyArea.find({ isActive: true }).sort({ name: 1 });
    res.json(areas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/study-areas/:id', async (req, res) => {
  try {
    const area = await StudyArea.findById(req.params.id);
    if (!area) return res.status(404).json({ message: 'Study area not found' });
    res.json(area);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




router.get('/labs', async (req, res) => {
  try {
    const LabTimetable = require('../models/LabTimetable');
    
    // Get all lab timetables
    const labTimetables = await LabTimetable.find().lean();
    
    const labList = labTimetables.map(timetable => ({
      name: timetable.labName,
      type: 'Laboratory',
      capacity: 30
    }));

    res.json(labList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/labs/:name/schedule', async (req, res) => {
  try {
    const { name } = req.params;
    const day = req.query.day;
    
    const LabTimetable = require('../models/LabTimetable');
    const LabBooking = require('../models/LabBooking');
    
    // Get lab timetable
    const labTimetable = await LabTimetable.findOne({ labName: name });
    
    if (!labTimetable) {
      return res.status(404).json({ message: 'Lab timetable not found' });
    }

    // Get pre-calculated free/busy slots from LabTimetable
    const daySchedule = labTimetable.days[day];
    if (!daySchedule) {
      return res.json({
        labName: name,
        day,
        sessions: [],
        freeSlots: [],
        bookings: [],
        capacity: 30
      });
    }

    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const bookings = await LabBooking.find({
      labName: name,
      date,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    res.json({
      labName: name,
      day,
      sessions: daySchedule.sessions || [],
      freeSlots: daySchedule.free || [],
      bookings,
      capacity: 30
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/labs/available', async (req, res) => {
  try {
    const { day, date, startTime, endTime, moduleCode, moduleName } = req.query;

    if (!day || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'day, date, startTime, and endTime are required' });
    }

    const LabTimetable = require('../models/LabTimetable');
    const LabBooking = require('../models/LabBooking');
    
    // Get all lab timetables
    const labTimetables = await LabTimetable.find().lean();
    
    const availableLabs = [];

    for (const labTimetable of labTimetables) {
      const labName = labTimetable.labName;
      
      // Get pre-calculated free slots from LabTimetable
      const dayFreeTime = labTimetable.days[day];
      if (!dayFreeTime || !dayFreeTime.free) {
        continue; // No free slots for this lab on this day
      }

      // Convert time to numeric for comparison
      const timeToNumber = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours + (minutes === 30 ? 0.5 : 0);
      };

      const requestedStart = timeToNumber(startTime);
      const requestedEnd = timeToNumber(endTime);

      // Check if requested time is inside any free slot
      const matchingSlot = dayFreeTime.free.find(slot => 
        requestedStart >= slot.start && requestedEnd <= slot.end
      );

      if (!matchingSlot) {
        continue; // Lab not available during requested time
      }

      // Check existing bookings for this lab and time
      const existingBooking = await LabBooking.findOne({
        labName,
        date,
        status: { $in: ['Pending', 'Confirmed'] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      });

      if (existingBooking) {
        continue; // Lab already booked during this time
      }

      // Lab is available
      availableLabs.push({
        name: labName,
        type: 'Laboratory',
        capacity: 30,
        seatsAvailable: 30, // Could be calculated based on existing bookings
        matchingSlot: {
          start: matchingSlot.start,
          end: matchingSlot.end
        },
        moduleCode,
        moduleName
      });
    }

    res.json({ availableLabs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/lab-bookings', async (req, res) => {
  try {
    const { studentId, studentName, labId, labName, moduleCode, moduleName, day, date, startTime, endTime, purpose, seatsNeeded } = req.body;

    if (!studentId || !labId || !labName || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Get user information to find their timetable
    const User = require('../models/User');
    const user = await User.findById(studentId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert user fields to timetable format
    const timetableQuery = {
      year: `Y${user.year}`,
      semester: `S${user.semester}`,
      batch: user.scheduleType === 'Weekend' ? 'WE' : 'WD',
      specialization: user.specialization,
      group: user.group
    };

    // Find StudentTimeTable to verify this is actually free time
    const StudentTimeTable = require('../models/StudentTimeTable');
    const studentTimetable = await StudentTimeTable.findOne(timetableQuery);
    
    if (!studentTimetable) {
      return res.status(404).json({ message: 'Timetable not found for this student' });
    }

    // Verify requested time is actually in student's free slots
    const dayFreeTime = studentTimetable.freeTime[day];
    if (!dayFreeTime || !dayFreeTime.free) {
      return res.status(400).json({ message: 'Student not free during this time' });
    }

    // Convert time to numeric for comparison
    const timeToNumber = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours + (minutes === 30 ? 0.5 : 0);
    };

    const requestedStart = timeToNumber(startTime);
    const requestedEnd = timeToNumber(endTime);

    // Check if requested time matches any free slot
    const isStudentFree = dayFreeTime.free.some(slot => 
      requestedStart >= slot.start && requestedEnd <= slot.end
    );

    if (!isStudentFree) {
      return res.status(400).json({ message: 'Student is not free during this time slot' });
    }

    // Check lab availability from LabTimetable
    const LabTimetable = require('../models/LabTimetable');
    const labTimetable = await LabTimetable.findOne({ labName });
    
    if (!labTimetable) {
      return res.status(404).json({ message: 'Lab timetable not found' });
    }

    const labDayFreeTime = labTimetable.days[day];
    if (!labDayFreeTime || !labDayFreeTime.free) {
      return res.status(400).json({ message: 'Lab not available on this day' });
    }

    // Check if requested time is inside lab free slot
    const isLabFree = labDayFreeTime.free.some(slot => 
      requestedStart >= slot.start && requestedEnd <= slot.end
    );

    if (!isLabFree) {
      return res.status(400).json({ message: 'Lab not available during this time' });
    }

    const existingBooking = await LabBooking.findOne({
      studentId,
      labName,
      date,
      status: { $in: ['Pending', 'Confirmed'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked a lab at this time' });
    }

    const overlapping = await LabBooking.find({
      labName,
      date,
      status: { $in: ['Pending', 'Confirmed'] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });

    if (overlapping.length >= 30) {
      return res.status(400).json({ message: 'Lab is fully booked for this time slot' });
    }

    const booking = await LabBooking.create({
      studentId,
      studentName: studentName || '',
      labId,
      labName,
      moduleCode: moduleCode || '',
      moduleName: moduleName || '',
      day,
      date,
      startTime,
      endTime,
      purpose: purpose || 'Lab Work',
      seatsNeeded: seatsNeeded || 1,
      status: 'Confirmed'
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/lab-bookings', async (req, res) => {
  try {
    const { studentId, date, status } = req.query;
    const query = {};
    if (studentId) query.studentId = studentId;
    if (date) query.date = date;
    if (status) query.status = status;

    const bookings = await LabBooking.find(query).sort({ date: -1, startTime: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/lab-bookings/:id', async (req, res) => {
  try {
    const booking = await LabBooking.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin/bookings', async (req, res) => {
  try {
    const { type, date } = req.query;
    
    if (type === 'lab') {
      const query = { status: { $in: ['Pending', 'Confirmed'] } };
      if (date) query.date = date;
      const bookings = await LabBooking.find(query).sort({ date: -1, startTime: 1 });
      return res.json({ bookings });
    }

    const labBookings = await LabBooking.find({ status: { $in: ['Pending', 'Confirmed'] } }).sort({ date: -1 }).limit(50);
    res.json({ labBookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/studyareabooking', async (req, res) => {
  try {
    const { userId, day, date, startTime, endTime } = req.body;

    if (!userId || !day || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Get user information to find their timetable
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert user fields to timetable format
    const timetableQuery = {
      year: `Y${user.year}`,
      semester: `S${user.semester}`,
      batch: user.scheduleType === 'Weekend' ? 'WE' : 'WD',
      specialization: user.specialization,
      group: user.group
    };

    // Find StudentTimeTable to verify this is actually free time
    const StudentTimeTable = require('../models/StudentTimeTable');
    const timetable = await StudentTimeTable.findOne(timetableQuery);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found for this student' });
    }

    // Verify the requested time is actually in student's free slots
    const dayFreeTime = timetable.freeTime[day];
    if (!dayFreeTime || !dayFreeTime.free) {
      return res.status(400).json({ message: 'No free time available on this day' });
    }

    // Convert time to numeric for comparison
    const timeToNumber = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours + (minutes === 30 ? 0.5 : 0);
    };

    const requestedStart = timeToNumber(startTime);
    const requestedEnd = timeToNumber(endTime);

    // Check if requested time is inside any free slot (allow partial bookings)
    const isFreeSlot = dayFreeTime.free.some(slot => 
      requestedStart >= slot.start && requestedEnd <= slot.end
    );

    if (!isFreeSlot) {
      return res.status(400).json({ message: 'Requested time is not a free slot' });
    }

    // Get available study areas
    const areas = await StudyArea.find({ isActive: true });
    if (areas.length === 0) {
      return res.status(404).json({ message: 'No study areas available' });
    }

    // Find first available study area without clash for the requested time
    const StudyAreaBooking = require('../models/StudyAreaBooking');
    let assignedArea = null;

    for (const area of areas) {
      // Check for existing bookings in this study area at the same time
      const clashes = await StudyAreaBooking.find({
        areaId: area._id,
        date,
        status: 'Confirmed',
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      });

      const hasClash = clashes.some(booking => {
        const bStart = toMinutes(booking.startTime);
        const bEnd = toMinutes(booking.endTime);
        const rStart = toMinutes(startTime);
        const rEnd = toMinutes(endTime);

        return rStart < bEnd && rEnd > bStart;
      });

      if (!hasClash) {
        assignedArea = area;
        break;
      }
    }

    if (!assignedArea) {
      return res.status(400).json({ message: 'No study areas available for this time slot' });
    }

    // Create booking record
    const booking = {
      userId,
      userName: user.name || '',
      areaId: assignedArea._id,
      areaName: assignedArea.name,
      day,
      date,
      startTime,
      endTime,
      status: 'Confirmed',
      bookedAt: new Date().toISOString()
    };

    // Save booking to database
    const savedBooking = await StudyAreaBooking.create(booking);

    res.status(201).json({
      message: 'Study area booked successfully',
      booking: savedBooking
    });

  } catch (error) {
    console.error('Study area booking error:', error);
    res.status(500).json({ message: 'Failed to book study area', error: error.message });
  }
});

module.exports = router;
