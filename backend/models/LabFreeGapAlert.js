const mongoose = require('mongoose');

const labFreeGapAlertSchema = new mongoose.Schema({
  labName: { type: String, required: true },
  day: { type: String, required: true },
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  duration: { type: Number, required: true },
  lecturerName: { type: String, required: true },
  lecturerId: { type: String, required: true },
  weekNumber: { type: Number, required: true },
  year: { type: Number, required: true },
  confirmed: { type: Boolean, default: false },
  confirmedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
labFreeGapAlertSchema.index({ lecturerName: 1 });
labFreeGapAlertSchema.index({ labName: 1, day: 1 });
labFreeGapAlertSchema.index(
  { labName: 1, day: 1, start: 1, end: 1, weekNumber: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model('LabFreeGapAlert', labFreeGapAlertSchema);
