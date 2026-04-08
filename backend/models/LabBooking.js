const mongoose = require('mongoose');

const labBookingSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, default: '' },
  labId: { type: String, required: true },
  labName: { type: String, required: true },
  moduleCode: { type: String, default: '' },
  moduleName: { type: String, default: '' },
  day: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Pending' },
  purpose: { type: String, default: 'Lab Work' },
  seatsNeeded: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('LabBooking', labBookingSchema);
