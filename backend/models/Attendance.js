const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  module: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  scannedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
