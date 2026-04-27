const express = require('express');
const router = express.Router();
const StudyArea = require('../models/StudyArea');
const StudyAreaBooking = require('../models/StudyAreaBooking');
const StudentTimeTable = require('../models/StudentTimeTable');
const User = require('../models/User');
const Notification = require('../models/Notification');

// GET all study areas
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, location } = req.query;
    
    // Build query
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    
    const studyAreas = await StudyArea.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await StudyArea.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        studyAreas,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching study areas',
      error: error.message
    });
  }
});

// GET single study area by ID
router.get('/:id', async (req, res) => {
  try {
    const studyArea = await StudyArea.findById(req.params.id);
    
    if (!studyArea) {
      return res.status(404).json({
        success: false,
        message: 'Study area not found'
      });
    }
    
    res.json({
      success: true,
      data: studyArea
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching study area',
      error: error.message
    });
  }
});

// POST create new study area
router.post('/', async (req, res) => {
  try {
    const { name, location, capacity, description, amenities } = req.body;
    
    // Validation
    if (!name || !location || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Name, location, and capacity are required'
      });
    }
    
    // Check for duplicate name
    const existingArea = await StudyArea.findOne({ 
      name: { $regex: `^${name}$`, $options: 'i' },
      isActive: true 
    });
    
    if (existingArea) {
      return res.status(400).json({
        success: false,
        message: 'Study area with this name already exists'
      });
    }
    
    const studyArea = new StudyArea({
      name: name.trim(),
      location: location.trim(),
      capacity: parseInt(capacity),
      description: description?.trim() || '',
      amenities: amenities || []
    });
    
    await studyArea.save();
    
    res.status(201).json({
      success: true,
      message: 'Study area created successfully',
      data: studyArea
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating study area',
      error: error.message
    });
  }
});

// PUT update study area
router.put('/:id', async (req, res) => {
  try {
    const { name, location, capacity, description, amenities, isActive } = req.body;
    
    const studyArea = await StudyArea.findById(req.params.id);
    
    if (!studyArea) {
      return res.status(404).json({
        success: false,
        message: 'Study area not found'
      });
    }
    
    // Check for duplicate name (excluding current record)
    if (name && name !== studyArea.name) {
      const existingArea = await StudyArea.findOne({ 
        name: { $regex: `^${name}$`, $options: 'i' },
        isActive: true,
        _id: { $ne: req.params.id }
      });
      
      if (existingArea) {
        return res.status(400).json({
          success: false,
          message: 'Study area with this name already exists'
        });
      }
    }
    
    // Update fields
    if (name) studyArea.name = name.trim();
    if (location) studyArea.location = location.trim();
    if (capacity) studyArea.capacity = parseInt(capacity);
    if (description !== undefined) studyArea.description = description.trim();
    if (amenities) studyArea.amenities = amenities;
    if (isActive !== undefined) studyArea.isActive = isActive;
    
    studyArea.updatedAt = new Date();
    await studyArea.save();
    
    res.json({
      success: true,
      message: 'Study area updated successfully',
      data: studyArea
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating study area',
      error: error.message
    });
  }
});

// DELETE study area
router.delete('/:id', async (req, res) => {
  try {
    const studyArea = await StudyArea.findById(req.params.id);
    
    if (!studyArea) {
      return res.status(404).json({
        success: false,
        message: 'Study area not found'
      });
    }
    
    // Soft delete - set isActive to false
    studyArea.isActive = false;
    studyArea.updatedAt = new Date();
    await studyArea.save();
    
    res.json({
      success: true,
      message: 'Study area deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting study area',
      error: error.message
    });
  }
});

// GET study area statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalAreas = await StudyArea.countDocuments({ isActive: true });
    const totalCapacity = await StudyArea.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalCapacity: { $sum: '$capacity' } } }
    ]);
    
    const areasByLocation = await StudyArea.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalAreas,
        totalCapacity: totalCapacity[0]?.totalCapacity || 0,
        areasByLocation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching study area statistics',
      error: error.message
    });
  }
});

// Helper function to convert time string to number
const timeToNumber = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + (minutes === 30 ? 0.5 : 0);
};

// Helper function to get day name from date
const getDayName = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

// Convert user fields to timetable format
const userToTimetableQuery = (user) => ({
  year: `Y${user.year}`,
  semester: `S${user.semester}`,
  batch: user.scheduleType === 'Weekend' ? 'WE' : 'WD',
  specialization: user.specialization,
  group: user.group
});

// POST create study area booking
router.post('/bookings', async (req, res) => {
  try {
    const { 
      userId, 
      studyAreaId, 
      date, 
      startTime, 
      endTime, 
      purpose, 
      numberOfStudents, 
      notes 
    } = req.body;
    
    // Validate required fields
    if (!userId || !studyAreaId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'User ID, study area ID, date, start time, and end time are required'
      });
    }
    
    // Convert times to numbers for comparison
    const startNum = timeToNumber(startTime);
    const endNum = timeToNumber(endTime);
    
    // Validate time range
    if (endNum <= startNum) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }
    
    // Get user information - try by MongoDB _id first, then by userId field
    let user = await User.findById(userId);
    if (!user) {
      user = await User.findOne({ userId: userId });
    }
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get study area
    const studyArea = await StudyArea.findById(studyAreaId);
    if (!studyArea) {
      return res.status(404).json({
        success: false,
        message: 'Study area not found'
      });
    }
    
    if (!studyArea.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Study area is not available for booking'
      });
    }
    
    // Check if booking date is in the future
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book study areas for past dates'
      });
    }
    
    // Get day name for the booking date
    const dayName = getDayName(bookingDate);
    
    // Get student's timetable to validate free time - use converted fields
    const timetableQuery = userToTimetableQuery(user);
    const timetable = await StudentTimeTable.findOne(timetableQuery);
    
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Student timetable not found'
      });
    }
    
    // Check if the requested time slot is in the student's free time
    const dayFreeTime = timetable.freeTime[dayName];
    if (!dayFreeTime || !dayFreeTime.free) {
      return res.status(400).json({
        success: false,
        message: `No free time slots found for ${dayName}`
      });
    }
    
    // Check if the requested time slot overlaps with any free slot
    const isFreeSlot = dayFreeTime.free.some(freeSlot => 
      startNum >= freeSlot.start && endNum <= freeSlot.end
    );
    
    if (!isFreeSlot) {
      return res.status(400).json({
        success: false,
        message: `The requested time slot (${startTime} - ${endTime}) is not available during your free time on ${dayName}`
      });
    }
    
    // Check for booking conflicts with the same study area
    const conflictingBookings = await StudyAreaBooking.findConflicts(
      studyAreaId, 
      bookingDate, 
      dayName, 
      startNum, 
      endNum
    );
    
    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Study area is already booked for this time slot'
      });
    }
    
    // Create the booking
    const booking = new StudyAreaBooking({
      user: userId,
      studyArea: studyAreaId,
      date: bookingDate,
      day: dayName,
      startTime,
      endTime,
      startNum,
      endNum,
      purpose: purpose?.trim() || '',
      numberOfStudents: numberOfStudents || 1,
      notes: notes?.trim() || ''
    });
    
    await booking.save();
    
    // Populate the booking with related data
    await booking.populate('user', 'name email');
    await booking.populate('studyArea', 'name location capacity');
    
    // Create booking notification for the student
    const bookingNotification = new Notification({
      type: 'booking_confirmed',
      recipientType: 'student',
      recipientId: user.userId,
      message: `Booking confirmed for ${studyArea.name} on ${bookingDate.toLocaleDateString()} (${startTime} - ${endTime})`,
      bookingId: booking._id,
      studyAreaName: studyArea.name,
      studyAreaLocation: studyArea.location,
      date: bookingDate.toISOString(),
      startTime,
      endTime,
      createdAt: new Date().toISOString(),
      read: false
    });
    await bookingNotification.save();
    
    res.status(201).json({
      success: true,
      message: 'Study area booking created successfully',
      data: booking
    });
    
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating study area booking',
      error: error.message
    });
  }
});

// GET user's bookings
router.get('/bookings/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    const options = {
      status,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit)
    };
    
    const result = await StudyAreaBooking.getUserBookings(userId, options);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user bookings',
      error: error.message
    });
  }
});

// GET study area bookings for a specific date
router.get('/bookings/study-area/:studyAreaId', async (req, res) => {
  try {
    const { studyAreaId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }
    
    const bookingDate = new Date(date);
    const dayName = getDayName(bookingDate);
    
    const bookings = await StudyAreaBooking.find({
      studyArea: studyAreaId,
      date: new Date(bookingDate.setHours(0, 0, 0, 0)),
      status: { $in: ['confirmed', 'completed'] }
    })
    .populate('user', 'name')
    .sort({ startNum: 1 });
    
    res.json({
      success: true,
      data: {
        date,
        day: dayName,
        bookings
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching study area bookings',
      error: error.message
    });
  }
});

// PUT update booking status (cancel/complete)
router.put('/bookings/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be confirmed, cancelled, or completed'
      });
    }
    
    const booking = await StudyAreaBooking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    booking.status = status;
    await booking.save();
    
    await booking.populate('user', 'name email');
    await booking.populate('studyArea', 'name location capacity');
    
    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: booking
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
});

// DELETE booking (soft delete by setting status to cancelled)
router.delete('/bookings/:bookingId', async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    
    const booking = await StudyAreaBooking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    const userId = booking.user.toString();
    await booking.populate('studyArea', 'name location');
    
    booking.status = 'cancelled';
    await booking.save();
    
    // Create cancellation notification for the student
    const cancelNotification = new Notification({
      type: 'booking_cancelled',
      recipientType: 'student',
      recipientId: userId,
      message: `Your booking for ${booking.studyArea?.name || 'Study Area'} on ${new Date(booking.date).toLocaleDateString()} has been cancelled`,
      bookingId: booking._id,
      studyAreaName: booking.studyArea?.name,
      studyAreaLocation: booking.studyArea?.location,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      createdAt: new Date().toISOString(),
      read: false
    });
    await cancelNotification.save();
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
});

module.exports = router;
