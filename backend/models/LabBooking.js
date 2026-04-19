const mongoose = require('mongoose');

const labBookingSchema = new mongoose.Schema({
  studentId: { type: String, required: true, ref: 'User' },
  studentName: { type: String, required: true },
  labName: { type: String, required: true },
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  startTime: { type: Number, required: true }, // Hour in 24h format
  endTime: { type: Number, required: true }, // Hour in 24h format
  status: { type: String, required: true, enum: ['Confirmed', 'Pending', 'Cancelled'], default: 'Confirmed' },
  createdAt: { type: Date, default: Date.now },
  cancelledAt: { type: Date }
});

// Compound indexes for efficient queries
labBookingSchema.index({ studentId: 1, date: 1, startTime: 1 });
labBookingSchema.index({ labName: 1, date: 1, startTime: 1 });
labBookingSchema.index({ date: 1, labName: 1 });

// Prevent duplicate bookings for same student, lab, date, and time
labBookingSchema.index(
  { studentId: 1, labName: 1, date: 1, startTime: 1 },
  { unique: true }
);

module.exports = mongoose.model('LabBooking', labBookingSchema);