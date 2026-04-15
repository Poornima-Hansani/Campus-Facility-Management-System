const mongoose = require('mongoose');

// Schema for individual lab with common free slots
const labSchema = new mongoose.Schema({
  labName: { type: String, required: true },
  days: {
    Monday: [{ start: Number, end: Number }],
    Tuesday: [{ start: Number, end: Number }],
    Wednesday: [{ start: Number, end: Number }],
    Thursday: [{ start: Number, end: Number }],
    Friday: [{ start: Number, end: Number }],
    Saturday: [{ start: Number, end: Number }],
    Sunday: [{ start: Number, end: Number }]
  }
});

// Main schema for lab-student common free time
const labStudentCommonFreeSchema = new mongoose.Schema({
  year: { type: String, required: true },
  semester: { type: String, required: true },
  batch: { type: String, enum: ['WD', 'WE'], required: true },
  specialization: { type: String, required: true },
  group: { type: String, required: true },
  labs: [labSchema],
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
});

// Add unique compound index to prevent duplicate entries
labStudentCommonFreeSchema.index(
  { year: 1, semester: 1, batch: 1, specialization: 1, group: 1 },
  { unique: true }
);

// Add index for efficient queries by lab and day
labStudentCommonFreeSchema.index({
  "labs.labName": 1,
  "labs.days.Monday": 1
});

labStudentCommonFreeSchema.index({
  "labs.labName": 1,
  "labs.days.Tuesday": 1
});

labStudentCommonFreeSchema.index({
  "labs.labName": 1,
  "labs.days.Wednesday": 1
});

labStudentCommonFreeSchema.index({
  "labs.labName": 1,
  "labs.days.Thursday": 1
});

labStudentCommonFreeSchema.index({
  "labs.labName": 1,
  "labs.days.Friday": 1
});

labStudentCommonFreeSchema.index({
  "labs.labName": 1,
  "labs.days.Saturday": 1
});

labStudentCommonFreeSchema.index({
  "labs.labName": 1,
  "labs.days.Sunday": 1
});

module.exports = mongoose.model('LabStudentCommonFree', labStudentCommonFreeSchema);
