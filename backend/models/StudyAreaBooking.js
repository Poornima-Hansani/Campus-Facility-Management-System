const mongoose = require('mongoose');

const studyAreaBookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, default: '' },
  areaId: { type: String, required: true },
  areaName: { type: String, required: true },
  day: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed' },
  bookedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('StudyAreaBooking', studyAreaBookingSchema);