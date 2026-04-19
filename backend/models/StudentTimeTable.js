const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true }, // Important for edit/delete
  day: { 
    type: String, 
    enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    required: true 
  },
  startTime: { 
    type: String, 
    required: true,
    match: /^([01]\d|2[0-3]):(00|30)$/ 
  },
  endTime: { 
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):(00|30)$/
  },
  startNum: { type: Number, required: true }, // 8, 8.5, 9, 9.5 for numeric comparison
  endNum: { type: Number, required: true },   // Numeric time for efficient queries
  type: { type: String, enum: ['LECTURE', 'LAB'], required: true },
  subject: { type: String, required: true, trim: true },
  lecturer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String, required: true }
});

const studentTimeTableSchema = new mongoose.Schema({
  year: String,
  semester: String,
  batch: { type: String, enum: ['WD', 'WE'] },
  specialization: String,
  group: String,
  sessions: [sessionSchema],
  freeTime: {
    Monday: { busy: [{ start: Number, end: Number }], free: [{ start: Number, end: Number }] },
    Tuesday: { busy: [{ start: Number, end: Number }], free: [{ start: Number, end: Number }] },
    Wednesday: { busy: [{ start: Number, end: Number }], free: [{ start: Number, end: Number }] },
    Thursday: { busy: [{ start: Number, end: Number }], free: [{ start: Number, end: Number }] },
    Friday: { busy: [{ start: Number, end: Number }], free: [{ start: Number, end: Number }] },
    Saturday: { busy: [{ start: Number, end: Number }], free: [{ start: Number, end: Number }] },
    Sunday: { busy: [{ start: Number, end: Number }], free: [{ start: Number, end: Number }] }
  }
});

// Add unique compound index to prevent duplicate timetables
studentTimeTableSchema.index(
  { year: 1, semester: 1, batch: 1, specialization: 1, group: 1 },
  { unique: true }
);

// Add compound indexes for efficient $elemMatch clash detection queries
studentTimeTableSchema.index({
  "sessions.day": 1,
  "sessions.lecturer": 1,
  "sessions.startNum": 1,
  "sessions.endNum": 1
});

studentTimeTableSchema.index({
  "sessions.day": 1,
  "sessions.location": 1,
  "sessions.startNum": 1,
  "sessions.endNum": 1
});

module.exports = mongoose.model('StudentTimeTable', studentTimeTableSchema);
