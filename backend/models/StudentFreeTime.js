const mongoose = require('mongoose');

const studentFreeTimeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make optional
  },
  studentIdentifier: {
    type: String,
    required: true // e.g., "Y1_S1_WE_1.1"
  },
  freeTimeSlots: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      default: 'Free time'
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    isBookable: {
      type: Boolean,
      default: true
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('StudentFreeTime', studentFreeTimeSchema);
