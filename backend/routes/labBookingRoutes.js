const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LabStudentCommonFree = require('../models/LabStudentCommonFree');
const LabBooking = require('../models/LabBooking');

// Helper functions to convert student values to DB format
const convertYearToDB = (year) => {
  return `Y${year}`;
};

const convertSemesterToDB = (semester) => {
  return `S${semester}`;
};

const convertScheduleTypeToBatch = (scheduleType) => {
  return scheduleType === 'Weekday' ? 'WD' : 'WE';
};

// Step C: Backend intelligence - Get allowed slots for logged student
router.get('/allowed-slots', async (req, res) => {
  try {
    const { studentId } = req.query;
    
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    // 1. Find student in users by userId
    const student = await User.findOne({ userId: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 2. Read student academic details
    const { year, semester, scheduleType, group } = student;
    if (!year || !semester || !scheduleType || !group) {
      return res.status(400).json({ message: 'Student academic details incomplete' });
    }

    // 3. Convert student values to DB format
    const dbYear = convertYearToDB(year);
    const dbSemester = convertSemesterToDB(semester);
    const batch = convertScheduleTypeToBatch(scheduleType);

    // 4. Search in labstudentcommonfrees
    const labCommonFree = await LabStudentCommonFree.findOne({
      year: dbYear,
      semester: dbSemester,
      batch,
      group
    });

    if (!labCommonFree) {
      return res.status(404).json({ message: 'No lab slots found for your academic details' });
    }

    // 5. Return the labs array to frontend
    res.json(labCommonFree.labs);
    
  } catch (error) {
    console.error('Error in /allowed-slots:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check slot availability
router.get('/slot-availability', async (req, res) => {
  try {
    const { labName, date, start, end } = req.query;
    
    if (!labName || !date || !start || !end) {
      return res.status(400).json({ message: 'labName, date, start, and end are required' });
    }

    // Convert to numbers for comparison
    const startTime = parseInt(start);
    const endTime = parseInt(end);

    // Check capacity from LabBooking
    const existingBookings = await LabBooking.countDocuments({
      labName,
      date,
      status: { $in: ['Confirmed', 'Pending'] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });

    const capacity = 30; // Standard lab capacity
    const seatsAvailable = capacity - existingBookings;

    res.json({
      seatsAvailable,
      totalCapacity: capacity,
      isAvailable: seatsAvailable > 0
    });
    
  } catch (error) {
    console.error('Error in /slot-availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Booking flow with proper validation sequence
router.post('/book-lab', async (req, res) => {
  try {
    const { studentId, labName, day, date, start, end } = req.body;
    
    if (!studentId || !labName || !day || !date || !start || !end) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Convert to numbers
    const startTime = parseInt(start);
    const endTime = parseInt(end);

    // 1. Check student exists
    const student = await User.findOne({ userId: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 2. Get student academic data
    const { year, semester, scheduleType, group } = student;
    
    // 3. Convert student values to DB format
    const dbYear = convertYearToDB(year);
    const dbSemester = convertSemesterToDB(semester);
    const batch = convertScheduleTypeToBatch(scheduleType);

    // 4. Match with labstudentcommonfrees
    const labCommonFree = await LabStudentCommonFree.findOne({
      year: dbYear,
      semester: dbSemester,
      batch,
      group
    });

    if (!labCommonFree) {
      return res.status(400).json({ message: 'Your academic details do not match any lab booking permissions' });
    }

    // 4. Verify that slot exists for that lab/day
    const labData = labCommonFree.labs.find(lab => lab.labName === labName);
    if (!labData) {
      return res.status(400).json({ message: 'Lab not found in your allowed labs' });
    }

    const daySlots = labData.days[day];
    if (!daySlots) {
      return res.status(400).json({ message: 'No slots available for this day' });
    }

    // Check if requested slot exists in allowed slots
    const slotExists = daySlots.some(slot => 
      startTime >= slot.start && endTime <= slot.end
    );

    if (!slotExists) {
      return res.status(400).json({ message: 'Requested time slot is not allowed for your group' });
    }

    // 5. Check capacity from LabBooking
    const existingBookings = await LabBooking.countDocuments({
      labName,
      date,
      status: { $in: ['Confirmed', 'Pending'] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });

    if (existingBookings >= 30) {
      return res.status(400).json({ message: 'Lab is fully booked for this time slot' });
    }

    // 6. Check student has not booked same slot
    const duplicateBooking = await LabBooking.findOne({
      studentId,
      labName,
      date,
      status: { $in: ['Confirmed', 'Pending'] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });

    if (duplicateBooking) {
      return res.status(400).json({ message: 'You have already booked this lab at this time' });
    }

    // 7. Save booking
    const booking = await LabBooking.create({
      studentId,
      studentName: student.name,
      labName,
      day,
      date,
      startTime,
      endTime,
      status: 'Confirmed'
    });

    res.status(201).json({
      message: 'Lab booked successfully',
      booking
    });
    
  } catch (error) {
    console.error('Error in /book-lab:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's bookings
router.get('/my-bookings', async (req, res) => {
  try {
    const { studentId } = req.query;
    
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    const bookings = await LabBooking.find({ 
      studentId,
      status: { $ne: 'Cancelled' }
    }).sort({ date: -1, startTime: 1 });

    res.json(bookings);
    
  } catch (error) {
    console.error('Error in /my-bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.delete('/cancel-booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await LabBooking.findByIdAndUpdate(
      bookingId,
      { 
        status: 'Cancelled',
        cancelledAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking cancelled successfully' });
    
  } catch (error) {
    console.error('Error in /cancel-booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
