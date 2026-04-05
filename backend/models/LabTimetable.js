const mongoose = require('mongoose');

const studentBatchSchema = new mongoose.Schema({
  batchType: {
    type: String,
    enum: ['weekday', 'weekend'],
    required: true,
  },
  faculty: { 
    type: String, 
    required: true 
  },
  year: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 4 
  },
  semester: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 2 
  },
  group: { 
    type: String, 
    required: true 
  },
  title: { 
    type: String 
  },
  // Reference to the main Timetable document
  timetableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable',
  }
});

const labSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['occupied', 'free', 'maintenance', 'reserved'],
    default: 'occupied',
  },
  title: {
    type: String,
    required: true,
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Student batch information for this slot
  studentBatches: [studentBatchSchema],
  // Subject/module information
  subject: {
    type: String,
    required: true,
  },
  // Session type
  sessionType: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial', 'practical', 'exam'],
    default: 'lab',
  },
  // Number of students expected
  studentCount: {
    type: Number,
    default: 0,
  }
});

const labTimetableSchema = new mongoose.Schema(
  {
    labNumber: { 
      type: String, 
      required: true,
      unique: true,
      set: v => v.startsWith('Lab') ? v : `Lab${v}` 
    },
    capacity: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    // Lab type/category
    labType: {
      type: String,
      enum: ['computer', 'science', 'engineering', 'general', 'specialized'],
      default: 'computer',
    },
    // Available equipment
    equipment: [{
      name: String,
      quantity: Number,
      condition: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor'],
        default: 'good'
      }
    }],
    // Lab schedule status
    isActive: {
      type: Boolean,
      default: true,
    },
    // All slots for this lab
    slots: [labSlotSchema],
    // Aggregated student batches using this lab
    allStudentBatches: [{
      batchType: {
        type: String,
        enum: ['weekday', 'weekend'],
        required: true,
      },
      faculty: { 
        type: String, 
        required: true 
      },
      year: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 4 
      },
      semester: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 2 
      },
      group: { 
        type: String, 
        required: true 
      },
      subject: String,
      lecturer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      weeklyHours: {
        type: Number,
        default: 0,
      }
    }],
    // Usage statistics
    usageStats: {
      totalWeeklyHours: {
        type: Number,
        default: 0,
      },
      averageOccupancy: {
        type: Number,
        default: 0,
      },
      peakUsageDay: String,
      peakUsageTime: String,
    }
  },
  { timestamps: true }
);

// Indexes for better query performance
labTimetableSchema.index({ 'slots.day': 1 });
labTimetableSchema.index({ 'slots.studentBatches.faculty': 1 });
labTimetableSchema.index({ 'slots.studentBatches.year': 1 });
labTimetableSchema.index({ 'slots.studentBatches.semester': 1 });

// Method to get all student batches for this lab
labTimetableSchema.methods.getAllStudentBatches = function() {
  const batches = new Set();
  
  this.slots.forEach(slot => {
    if (slot.studentBatches && slot.studentBatches.length > 0) {
      slot.studentBatches.forEach(batch => {
        const batchKey = `${batch.faculty}_Y${batch.year}_S${batch.semester}_${batch.batchType}${batch.group}`;
        batches.add({
          key: batchKey,
          faculty: batch.faculty,
          year: batch.year,
          semester: batch.semester,
          batchType: batch.batchType,
          group: batch.group,
          title: batch.title,
          subject: slot.subject,
          lecturer: slot.lecturer
        });
      });
    }
  });
  
  return Array.from(batches);
};

// Method to get timetable by faculty
labTimetableSchema.methods.getTimetableByFaculty = function(faculty) {
  return this.slots.filter(slot => 
    slot.studentBatches.some(batch => batch.faculty === faculty)
  );
};

// Method to get timetable by year/semester
labTimetableSchema.methods.getTimetableByYearSemester = function(year, semester) {
  return this.slots.filter(slot => 
    slot.studentBatches.some(batch => 
      batch.year === year && batch.semester === semester
    )
  );
};

// Pre-save middleware to update usage statistics
labTimetableSchema.pre('save', function(next) {
  // Calculate total weekly hours
  let totalHours = 0;
  const dayUsage = {};
  
  this.slots.forEach(slot => {
    if (slot.status === 'occupied') {
      const start = new Date(`2000-01-01 ${slot.startTime}`);
      const end = new Date(`2000-01-01 ${slot.endTime}`);
      const hours = (end - start) / (1000 * 60 * 60);
      totalHours += hours;
      
      dayUsage[slot.day] = (dayUsage[slot.day] || 0) + hours;
    }
  });
  
  this.usageStats.totalWeeklyHours = totalHours;
  
  // Find peak usage day
  let maxDay = '';
  let maxHours = 0;
  Object.entries(dayUsage).forEach(([day, hours]) => {
    if (hours > maxHours) {
      maxHours = hours;
      maxDay = day;
    }
  });
  this.usageStats.peakUsageDay = maxDay;
  
  // Calculate average occupancy
  if (this.capacity > 0) {
    const totalStudents = this.slots.reduce((sum, slot) => sum + (slot.studentCount || 0), 0);
    this.usageStats.averageOccupancy = (totalStudents / (this.slots.length * this.capacity)) * 100;
  }
  
  next();
});

module.exports = mongoose.model('LabTimetable', labTimetableSchema);
