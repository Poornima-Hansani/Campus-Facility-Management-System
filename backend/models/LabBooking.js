const mongoose = require('mongoose');

const labBookingSchema = new mongoose.Schema({
  studentIdentifier: {
    type: String,
    required: true // e.g., "1S1_weekend_Faculty of Computing_1.1"
  },
  labNumber: {
    type: String,
    required: true // e.g., "F306"
  },
  bookingDate: {
    type: Date,
    required: false // Make optional for available bookings
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  purpose: {
    type: String,
    required: false // Make optional for available bookings
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'available'], // Add 'available' status
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  duration: {
    type: Number,
    required: false // Add duration field
  },
  matchType: {
    type: String,
    required: false // Add match type field
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('LabBooking', labBookingSchema);
