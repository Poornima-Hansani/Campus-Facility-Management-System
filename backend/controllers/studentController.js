const User = require('../models/User');
const Timetable = require('../models/Timetable');
const StudentFreeTime = require('../models/StudentFreeTime');
const LabBooking = require('../models/LabBooking');
const StudentLabBooked = require('../models/StudentLabBooked');

const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins) => {
  const h = String(Math.floor(mins / 60)).padStart(2, '0');
  const m = String(mins % 60).padStart(2, '0');
  return `${h}:${m}`;
};

exports.getStudentFreeTime = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // ✅ FIX 1 — Use WEWD field
    const batchType = student.wewd === 'WE' ? 'weekend' : 'weekday';

    // ✅ FIX 2 — Proper timetable matching
    const timetable = await Timetable.findOne({
      batchType,
      faculty: student.faculty,
      year: student.year,
      semester: student.semester,
      group: student.group
    });

    if (!timetable) {
      return res.json({ freeTime: [] });
    }

    // ✅ FIX 3 — Correct allowed days
    const allowedDays =
      batchType === 'weekend'
        ? ['Saturday', 'Sunday']
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const dayStart = '08:00';
    const dayEnd = batchType === 'weekend' ? '20:00' : '17:30';

    const startMin = timeToMinutes(dayStart);
    const endMin = timeToMinutes(dayEnd);

    const freeTimes = [];

    for (const dayObj of timetable.days) {
      if (!allowedDays.includes(dayObj.day)) continue;

      const slots = dayObj.slots
        .map(s => ({
          start: timeToMinutes(s.startTime),
          end: timeToMinutes(s.endTime)
        }))
        .sort((a, b) => a.start - b.start);

      let current = startMin;

      for (const slot of slots) {
        if (slot.start > current) {
          freeTimes.push({
            day: dayObj.day,
            from: minutesToTime(current),
            to: minutesToTime(slot.start)
          });
        }
        current = Math.max(current, slot.end);
      }

      if (current < endMin) {
        freeTimes.push({
          day: dayObj.day,
          from: minutesToTime(current),
          to: minutesToTime(endMin)
        });
      }
    }

    res.json({ freeTime: freeTimes });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New function to get StudentFreeTimes by studentIdentifier
exports.getStudentFreeTimesByIdentifier = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Generate studentIdentifier based on user's academic information
    const batchType = student.wewd === 'WE' ? 'weekend' : 'weekday';
    const studentIdentifier = `${student.year}S${student.semester}_${batchType}_${student.faculty}_${student.group}`;

    // Find StudentFreeTimes by generated identifier
    const studentFreeTime = await StudentFreeTime.findOne({ 
      studentIdentifier: studentIdentifier 
    });
    
    if (!studentFreeTime) {
      return res.json({ 
        message: 'No free time schedule found for this student',
        studentIdentifier: studentIdentifier,
        freeTimeSlots: []
      });
    }
    
    // Group slots by day for better organization
    const groupedSlots = {};
    studentFreeTime.freeTimeSlots.forEach(slot => {
      if (!groupedSlots[slot.day]) {
        groupedSlots[slot.day] = [];
      }
      groupedSlots[slot.day].push({
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason: slot.reason,
        priority: slot.priority,
        isBookable: slot.isBookable
      });
    });
    
    res.json({
      studentIdentifier: studentFreeTime.studentIdentifier,
      freeTimeSlots: groupedSlots,
      totalFreeSlots: studentFreeTime.freeTimeSlots.length,
      lastUpdated: studentFreeTime.lastUpdated
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available lab slots for a student
exports.getAvailableLabSlots = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Generate studentIdentifier based on user's academic information
    const batchType = student.wewd === 'WE' ? 'weekend' : 'weekday';
    const studentIdentifier = `${student.year}S${student.semester}_${batchType}_${student.faculty}_${student.group}`;

    // Find available lab bookings for this student's identifier
    const availableLabBookings = await LabBooking.find({ 
      studentIdentifier: studentIdentifier,
      status: 'available'
    }).sort({ day: 1, startTime: 1 });

    if (availableLabBookings.length === 0) {
      return res.json({
        message: 'No available lab slots found for this student',
        studentIdentifier: studentIdentifier,
        labSlots: []
      });
    }

    // Group lab slots by day for better organization
    const groupedLabSlots = {};
    availableLabBookings.forEach(booking => {
      if (!groupedLabSlots[booking.day]) {
        groupedLabSlots[booking.day] = [];
      }
      groupedLabSlots[booking.day].push({
        labNumber: booking.labNumber,
        startTime: booking.startTime,
        endTime: booking.endTime,
        purpose: booking.purpose,
        priority: booking.priority,
        duration: booking.duration,
        matchType: booking.matchType,
        labBookingId: booking._id
      });
    });

    res.json({
      studentIdentifier: studentIdentifier,
      labSlots: groupedLabSlots,
      totalLabSlots: availableLabBookings.length,
      availableDays: Object.keys(groupedLabSlots)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Book a lab slot
exports.bookLabSlot = async (req, res) => {
  try {
    const { labBookingId, bookingDate, purpose } = req.body;
    const studentId = req.params.id;

    // Validate student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Validate lab booking exists and is available
    const labBooking = await LabBooking.findById(labBookingId);
    if (!labBooking) {
      return res.status(404).json({ message: 'Lab booking not found' });
    }

    if (labBooking.status !== 'available') {
      return res.status(400).json({ message: 'This lab slot is no longer available' });
    }

    // Generate studentIdentifier
    const batchType = student.wewd === 'WE' ? 'weekend' : 'weekday';
    const studentIdentifier = `${student.year}S${student.semester}_${batchType}_${student.faculty}_${student.group}`;

    // Check if student already booked this slot
    const existingBooking = await StudentLabBooked.findOne({
      studentId: studentId,
      labNumber: labBooking.labNumber,
      day: labBooking.day,
      startTime: labBooking.startTime,
      endTime: labBooking.endTime,
      bookingDate: new Date(bookingDate),
      status: { $ne: 'cancelled' }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this lab slot' });
    }

    // Create the student lab booking
    const studentLabBooked = new StudentLabBooked({
      studentId: studentId,
      studentIdentifier: studentIdentifier,
      labNumber: labBooking.labNumber,
      day: labBooking.day,
      startTime: labBooking.startTime,
      endTime: labBooking.endTime,
      bookingDate: new Date(bookingDate),
      purpose: purpose || labBooking.purpose,
      priority: labBooking.priority,
      duration: labBooking.duration,
      originalLabBookingId: labBookingId
    });

    await studentLabBooked.save();

    // Update the original lab booking status if needed
    labBooking.status = 'confirmed';
    await labBooking.save();

    res.status(201).json({
      message: 'Lab slot booked successfully',
      booking: studentLabBooked,
      labInfo: {
        labNumber: labBooking.labNumber,
        day: labBooking.day,
        startTime: labBooking.startTime,
        endTime: labBooking.endTime,
        bookingDate: bookingDate
      }
    });

  } catch (error) {
    console.error('Error booking lab slot:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student's lab bookings
exports.getStudentLabBookings = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Validate student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get student's lab bookings
    const labBookings = await StudentLabBooked.find({ 
      studentId: studentId,
      status: { $ne: 'cancelled' }
    })
    .populate('originalLabBookingId')
    .sort({ bookingDate: 1, startTime: 1 });

    // Group bookings by date for better organization
    const groupedBookings = {};
    labBookings.forEach(booking => {
      const dateKey = booking.bookingDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      if (!groupedBookings[dateKey]) {
        groupedBookings[dateKey] = [];
      }
      groupedBookings[dateKey].push({
        _id: booking._id,
        labNumber: booking.labNumber,
        day: booking.day,
        startTime: booking.startTime,
        endTime: booking.endTime,
        purpose: booking.purpose,
        status: booking.status,
        priority: booking.priority,
        bookedAt: booking.bookedAt,
        originalLabBookingId: booking.originalLabBookingId
      });
    });

    res.json({
      studentId: studentId,
      studentName: student.name,
      labBookings: groupedBookings,
      totalBookings: labBookings.length,
      upcomingBookings: labBookings.filter(b => 
        b.bookingDate >= new Date() && b.status === 'confirmed'
      ).length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel a lab booking
exports.cancelLabBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const studentId = req.params.id;

    // Find the booking
    const booking = await StudentLabBooked.findOne({
      _id: bookingId,
      studentId: studentId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed booking' });
    }

    // Check if booking is in the future (can only cancel future bookings)
    const bookingDateTime = new Date(booking.bookingDate);
    const now = new Date();
    if (bookingDateTime <= now) {
      return res.status(400).json({ message: 'Cannot cancel past or current bookings' });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.lastUpdated = new Date();
    await booking.save();

    // Update original lab booking status back to available
    if (booking.originalLabBookingId) {
      await LabBooking.findByIdAndUpdate(
        booking.originalLabBookingId,
        { status: 'available' }
      );
    }

    res.json({
      message: 'Lab booking cancelled successfully',
      cancelledBooking: booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};