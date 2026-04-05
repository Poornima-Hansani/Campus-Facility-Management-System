const mongoose = require('mongoose');

const studentLabBookedSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentIdentifier: {
    type: String,
    required: true // e.g., "1S1_weekend_Faculty of Computing_1.1"
  },
  labNumber: {
    type: String,
    required: true // e.g., "F306"
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true // e.g., "09:00"
  },
  endTime: {
    type: String,
    required: true // e.g., "11:00"
  },
  bookingDate: {
    type: Date,
    required: true // The actual date when the lab session will occur
  },
  purpose: {
    type: String,
    required: false // Purpose of the booking (optional)
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  duration: {
    type: Number, // Duration in minutes
    required: false
  },
  originalLabBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabBooking',
    required: false // Reference to the original LabBooking if applicable
  },
  bookedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient queries
studentLabBookedSchema.index({ studentId: 1, bookingDate: 1 });
studentLabBookedSchema.index({ studentIdentifier: 1, day: 1 });
studentLabBookedSchema.index({ labNumber: 1, day: 1, startTime: 1 });

module.exports = mongoose.model('StudentLabBooked', studentLabBookedSchema);
