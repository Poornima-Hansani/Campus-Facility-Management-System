// backend/models/Timetable.js
const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  labNumber: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const daySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
  },
  slots: [slotSchema],
});

const timetableSchema = new mongoose.Schema(
  {
    batchType: {
      type: String,
      enum: ['weekday', 'weekend'],
      required: true,
    },
    faculty: { type: String, required: true },
    year: { type: Number, required: true, min: 1, max: 4 },
    semester: { type: Number, required: true, min: 1, max: 2 },
    group: { type: String, required: true },

    title: { type: String },

    days: [daySchema],

    status: {
      type: String,
      enum: ['draft', 'completed'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

// ✅ Auto-generate title
timetableSchema.pre('save', function () {
  if (!this.title) {
    const batchCode = this.batchType === 'weekday' ? 'WD' : 'WE';
    const groupCode = this.group.replace('.', '');
    this.title = `Y${this.year}_S${this.semester}_${batchCode}${groupCode}`;
  }
});

module.exports = mongoose.model('Timetable', timetableSchema);