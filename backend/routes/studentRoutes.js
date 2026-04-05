const express = require('express');
const router = express.Router();
const { 
  getStudentFreeTime, 
  getStudentFreeTimesByIdentifier, 
  getAvailableLabSlots,
  bookLabSlot,
  getStudentLabBookings,
  cancelLabBooking
} = require('../controllers/studentController');

router.get('/free-time/:id', getStudentFreeTime);
router.get('/free-times/:id', getStudentFreeTimesByIdentifier);

// Lab booking routes
router.get('/lab-slots/:id', getAvailableLabSlots);
router.post('/book-lab/:id', bookLabSlot);
router.get('/lab-bookings/:id', getStudentLabBookings);
router.delete('/lab-bookings/:id/:bookingId', cancelLabBooking);

module.exports = router;