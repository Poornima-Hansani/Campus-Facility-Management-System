const mongoose = require('mongoose');

const energyNotificationSchema = new mongoose.Schema({
  lab: { type: String, required: true },
  labName: { type: String, default: '' },
  lecturerId: { type: String, required: true },
  lecturerName: { type: String, default: '' },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'expired'], default: 'pending' },
  date: { type: String, required: true },
  freeTimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabFreeTime' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('EnergyNotification', energyNotificationSchema);