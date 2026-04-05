const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studyArea: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyArea', required: true },
  day: String,
  from: String,
  to: String,
  date: String,
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);