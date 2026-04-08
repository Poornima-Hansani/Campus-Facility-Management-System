const express = require('express');
const router = express.Router();
const StudyArea = require('../models/StudyArea');
const StudyBooking = require('../models/StudyBooking');
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

function calculateFreeSlots(sessions, dayType) {
  const startDay = 8 * 60;
  const endDay = dayType === 'weekend' ? 20 * 60 : 17 * 60 + 30;

  const sorted = sessions
    .map(s => ({ start: toMinutes(s.startTime), end: toMinutes(s.endTime) }))
    .sort((a, b) => a.start - b.start);

  let freeSlots = [];
  let current = startDay;

  for (let s of sorted) {
    if (s.start > current) {
      freeSlots.push({ start: toTimeStr(current), end: toTimeStr(s.start) });
    }
    current = Math.max(current, s.end);
  }

  if (current < endDay) {
    freeSlots.push({ start: toTimeStr(current), end: toTimeStr(endDay) });
  }

  return freeSlots;
}

function findOverlappingSlots(slots1, slots2) {
  let valid = [];
  for (let s of slots1) {
    for (let l of slots2) {
      const sStart = toMinutes(s.start);
      const sEnd = toMinutes(s.end);
      const lStart = toMinutes(l.start);
      const lEnd = toMinutes(l.end);

      const start = Math.max(sStart, lStart);
      const end = Math.min(sEnd, lEnd);

      if (start < end) {
        valid.push({ start: toTimeStr(start), end: toTimeStr(end) });
      }
    }
  }
  return valid;
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

    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const bookings = await StudyBooking.find({
      areaId: area._id,
      date,
      status: 'Confirmed'
    });

    res.json({
      ...area.toObject(),
      bookings: bookings.length,
      availableSeats: area.capacity - bookings.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/study-bookings', async (req, res) => {
  try {
    const { studentId, studentName, areaId, areaName, day, date, startTime, endTime, purpose } = req.body;

    if (!studentId || !areaId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const area = await StudyArea.findById(areaId);
    if (!area) return res.status(404).json({ message: 'Study area not found' });

    const existing = await StudyBooking.find({
      areaId,
      date,
      status: 'Confirmed',
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (existing.length >= area.capacity) {
      return res.status(400).json({ message: 'Study area is fully booked for this time slot' });
    }

    const duplicate = await StudyBooking.findOne({
      studentId,
      areaId,
      date,
      status: 'Confirmed',
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });

    if (duplicate) {
      return res.status(400).json({ message: 'You have already booked this area at this time' });
    }

    const booking = await StudyBooking.create({
      studentId,
      studentName: studentName || '',
      areaId,
      areaName,
      day,
      date,
      startTime,
      endTime,
      purpose: purpose || 'Study',
      status: 'Confirmed'
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/study-bookings', async (req, res) => {
  try {
    const { studentId, date } = req.query;
    const query = { status: 'Confirmed' };
    if (studentId) query.studentId = studentId;
    if (date) query.date = date;

    const bookings = await StudyBooking.find(query).sort({ date: -1, startTime: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/study-bookings/:id', async (req, res) => {
  try {
    const booking = await StudyBooking.findByIdAndUpdate(
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

router.get('/labs', async (req, res) => {
  try {
    const labs = await TimetableSession.find({
      sessionType: { $regex: /lab/i },
      venueName: { $exists: true }
    }).distinct('venueName');

    const labList = labs.map(name => ({
      name,
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
    const sessions = await TimetableSession.find({
      sessionType: { $regex: /lab/i },
      venueName: name
    }).sort({ day: 1, startTime: 1 });

    const dayType = ['Saturday', 'Sunday'].includes(req.query.day) ? 'weekend' : 'weekday';
    const freeSlots = calculateFreeSlots(sessions, dayType);

    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const bookings = await LabBooking.find({
      labName: name,
      date,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    res.json({
      labName: name,
      sessions,
      freeSlots,
      bookings,
      capacity: 30
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/student/free-slots', async (req, res) => {
  try {
    const { studentId, day } = req.query;
    if (!studentId || !day) {
      return res.status(400).json({ message: 'studentId and day are required' });
    }

    const sessions = await TimetableSession.find({
      moduleName: { $exists: true },
      day
    }).lean();

    const dayType = ['Saturday', 'Sunday'].includes(day) ? 'weekend' : 'weekday';
    const freeSlots = calculateFreeSlots(sessions, dayType);

    res.json({ day, freeSlots });
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

    const dayType = ['Saturday', 'Sunday'].includes(day) ? 'weekend' : 'weekday';

    const allLabNames = await TimetableSession.distinct('venueName', {
      sessionType: { $regex: /lab/i }
    });

    const availableLabs = [];

    for (const labName of allLabNames) {
      const labSessions = await TimetableSession.find({
        sessionType: { $regex: /lab/i },
        venueName: labName,
        day
      }).lean();

      const labFreeSlots = calculateFreeSlots(labSessions, dayType);

      const studentNeed = { start: startTime, end: endTime };
      const matchingSlots = labFreeSlots.filter(slot => {
        const slotStart = toMinutes(slot.start);
        const slotEnd = toMinutes(slot.end);
        const needStart = toMinutes(studentNeed.start);
        const needEnd = toMinutes(studentNeed.end);
        return needStart >= slotStart && needEnd <= slotEnd;
      });

      if (matchingSlots.length > 0) {
        const existingBooking = await LabBooking.findOne({
          labName,
          date,
          status: { $in: ['Pending', 'Confirmed'] },
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        });

        if (!existingBooking) {
          const labBookings = await LabBooking.countDocuments({
            labName,
            date,
            status: { $in: ['Pending', 'Confirmed'] },
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          });

          availableLabs.push({
            name: labName,
            type: 'Laboratory',
            capacity: 30,
            seatsAvailable: 30 - labBookings,
            matchingSlot: matchingSlots[0],
            moduleCode,
            moduleName
          });
        }
      }
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
    
    if (type === 'study') {
      const query = { status: 'Confirmed' };
      if (date) query.date = date;
      const bookings = await StudyBooking.find(query)
        .populate('areaId')
        .sort({ date: -1, startTime: 1 });
      return res.json({ bookings });
    }
    
    if (type === 'lab') {
      const query = { status: { $in: ['Pending', 'Confirmed'] } };
      if (date) query.date = date;
      const bookings = await LabBooking.find(query).sort({ date: -1, startTime: 1 });
      return res.json({ bookings });
    }

    const [studyBookings, labBookings] = await Promise.all([
      StudyBooking.find({ status: 'Confirmed' }).sort({ date: -1 }).limit(50),
      LabBooking.find({ status: { $in: ['Pending', 'Confirmed'] } }).sort({ date: -1 }).limit(50)
    ]);

    res.json({ studyBookings, labBookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
