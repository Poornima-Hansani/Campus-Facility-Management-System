const express = require('express');
const router = express.Router();
const LabBooking = require('../models/LabBooking');
const StudentFreeTime = require('../models/StudentFreeTime');
const LabFreeTime = require('../models/LabFreeTime');

// GET all available lab bookings
router.get('/available', async (req, res) => {
  try {
    const availableBookings = await LabBooking.find({ 
      status: 'available' 
    })
    .sort({ studentIdentifier: 1, labNumber: 1, day: 1, startTime: 1 });
    
    res.json(availableBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET available bookings for specific student
router.get('/available/student/:studentIdentifier', async (req, res) => {
  try {
    const { studentIdentifier } = req.params;
    const availableBookings = await LabBooking.find({ 
      studentIdentifier: studentIdentifier,
      status: 'available' 
    })
    .sort({ day: 1, startTime: 1 });
    
    res.json(availableBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET available bookings for specific lab
router.get('/available/lab/:labNumber', async (req, res) => {
  try {
    const { labNumber } = req.params;
    const availableBookings = await LabBooking.find({ 
      labNumber: labNumber,
      status: 'available' 
    })
    .sort({ day: 1, startTime: 1 });
    
    res.json(availableBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET available bookings for specific student and lab
router.get('/available/student/:studentIdentifier/lab/:labNumber', async (req, res) => {
  try {
    const { studentIdentifier, labNumber } = req.params;
    const availableBookings = await LabBooking.find({ 
      studentIdentifier: studentIdentifier,
      labNumber: labNumber,
      status: 'available' 
    })
    .sort({ day: 1, startTime: 1 });
    
    res.json(availableBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Book a lab slot
router.post('/book', async (req, res) => {
  try {
    const { 
      studentIdentifier, 
      labNumber, 
      day, 
      startTime, 
      endTime, 
      purpose,
      bookingDate 
    } = req.body;

    // Check if slot is still available
    const existingBooking = await LabBooking.findOne({
      studentIdentifier,
      labNumber,
      day,
      startTime,
      endTime,
      status: 'available'
    });

    if (existingBooking) {
      // Update the available booking to confirmed
      const booking = await LabBooking.findByIdAndUpdate(
        existingBooking._id,
        { 
          status: 'confirmed',
          purpose: purpose,
          bookingDate: bookingDate || new Date()
        },
        { new: true }
      );

      res.json({
        message: 'Lab booked successfully',
        booking: booking
      });
    } else {
      res.status(404).json({ 
        message: 'Available booking slot not found' 
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET student's confirmed bookings
router.get('/booked/student/:studentIdentifier', async (req, res) => {
  try {
    const { studentIdentifier } = req.params;
    const bookedSlots = await LabBooking.find({ 
      studentIdentifier: studentIdentifier,
      status: 'confirmed' 
    })
    .sort({ bookingDate: -1, day: 1, startTime: 1 });
    
    res.json(bookedSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET lab's confirmed bookings
router.get('/booked/lab/:labNumber', async (req, res) => {
  try {
    const { labNumber } = req.params;
    const bookedSlots = await LabBooking.find({ 
      labNumber: labNumber,
      status: 'confirmed' 
    })
    .sort({ bookingDate: -1, day: 1, startTime: 1 });
    
    res.json(bookedSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE - Cancel a booking
router.delete('/cancel/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await LabBooking.findByIdAndUpdate(
      bookingId,
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ 
        message: 'Booking not found' 
      });
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Calculate available lab bookings (from previous script)
router.post('/calculate', async (req, res) => {
  try {
    const { findAvailableLabBookings } = require('../findAvailableLabBookings');
    
    // Run the calculation
    await findAvailableLabBookings();
    
    res.json({
      message: 'Available lab bookings calculated successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET booking statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalAvailable: await LabBooking.countDocuments({ status: 'available' }),
      totalConfirmed: await LabBooking.countDocuments({ status: 'confirmed' }),
      totalCancelled: await LabBooking.countDocuments({ status: 'cancelled' }),
      bookingsByStudent: await LabBooking.aggregate([
        {
          $group: {
            _id: '$studentIdentifier',
            count: { $sum: 1 },
            confirmed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]),
      bookingsByLab: await LabBooking.aggregate([
        {
          $group: {
            _id: '$labNumber',
            count: { $sum: 1 },
            confirmed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { count: -1 }
        }
      ])
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
