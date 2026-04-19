const mongoose = require('mongoose');

// Lab session schema for busy slots
const labSessionSchema = new mongoose.Schema({
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  year: { type: String, required: true },
  semester: { type: String, required: true },
  batch: { type: String, required: true },
  specialization: { type: String, required: true },
  group: { type: String, required: true },
  lecturerName: { type: String, required: true },
  lecturerId: { type: String, required: true },
  subject: { type: String, required: true }
});

// Day schema with busy and free time arrays
const daySchema = new mongoose.Schema({
  busy: [labSessionSchema],
  free: [{ start: Number, end: Number }]
});

// Main LabTimetable schema
const labTimetableSchema = new mongoose.Schema({
  labName: { 
    type: String, 
    required: true, 
    unique: true 
  },
  days: {
    Monday: daySchema,
    Tuesday: daySchema,
    Wednesday: daySchema,
    Thursday: daySchema,
    Friday: daySchema,
    Saturday: daySchema,
    Sunday: daySchema
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
});

// Index is already defined in the schema, no need for duplicate

module.exports = mongoose.model('LabTimetable', labTimetableSchema);