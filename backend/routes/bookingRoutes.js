const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Create booking
router.post('/', async (req, res) => {
  const booking = new Booking(req.body);
  await booking.save();
  res.json({ message: 'Booked successfully' });
});

// Get student bookings
router.get('/student/:id', async (req, res) => {
  const data = await Booking.find({ student: req.params.id })
    .populate('studyArea')
    .populate('student');
  res.json(data);
});

// GET ALL bookings for admin
router.get('/', async (req, res) => {
  try {
    const data = await Booking.find({})
      .populate('student', 'name email')  // Only get name and email from student
      .populate('studyArea', 'name capacity location') // Get name, capacity, location from studyArea
      .sort({ createdAt: -1 }); // Sort by newest first at database level
    
    console.log('Admin bookings fetched:', data.length);
    res.json(data);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// DELETE booking
router.delete('/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Failed to delete booking' });
  }
});

module.exports = router;