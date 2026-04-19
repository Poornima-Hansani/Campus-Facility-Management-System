const mongoose = require('mongoose');

const labFreeTimeSchema = new mongoose.Schema({
  lab: { type: String, required: true },
  day: { type: String, required: true },
  date: { type: String, default: '' },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number, required: true },
  isEnergyWaste: { type: Boolean, default: false },
  lecturerId: { type: String, default: '' },
  lecturerName: { type: String, default: '' },
  confirmed: { type: Boolean, default: false },
  notified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('LabFreeTime', labFreeTimeSchema);