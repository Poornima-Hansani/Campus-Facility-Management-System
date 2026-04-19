const mongoose = require('mongoose');

const studyBookingSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, default: '' },
  areaId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyArea', required: true },
  areaName: { type: String, required: true },
  day: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['Confirmed', 'Cancelled', 'Completed'], default: 'Confirmed' },
  purpose: { type: String, default: 'Study' }
}, { timestamps: true });

module.exports = mongoose.model('StudyBooking', studyBookingSchema);
