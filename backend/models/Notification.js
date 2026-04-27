const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  recipientType: { type: String, required: true },
  recipientId: { type: String, required: true },
  message: { type: String, required: true },
  // Issue report fields
  reportId: { type: String, default: null },
  location: { type: String, default: null },
  issueType: { type: String, default: null },
  staffName: { type: String, default: null },
  studentId: { type: String, default: null },
  // Help request fields
  moduleCode: { type: String, default: null },
  moduleName: { type: String, default: null },
  topic: { type: String, default: null },
  helpRequestId: { type: Number, default: null },
  reply: { type: String, default: null },
  // Booking fields
  bookingId: { type: mongoose.Schema.Types.ObjectId, default: null },
  studyAreaName: { type: String, default: null },
  studyAreaLocation: { type: String, default: null },
  date: { type: Date, default: null },
  startTime: { type: String, default: null },
  endTime: { type: String, default: null },
  // Common fields
  createdAt: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { collection: 'notifications' });

module.exports = mongoose.model('Notification', notificationSchema);