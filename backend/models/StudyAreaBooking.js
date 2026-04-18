const mongoose = require('mongoose');

const studyAreaBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  studyArea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyArea',
    required: [true, 'Study area reference is required']
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: [true, 'Day is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: /^([01]\d|2[0-3]):(00|30)$/
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: /^([01]\d|2[0-3]):(00|30)$/
  },
  startNum: {
    type: Number,
    required: [true, 'Start time numeric is required']
  },
  endNum: {
    type: Number,
    required: [true, 'End time numeric is required']
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  purpose: {
    type: String,
    trim: true,
    maxlength: [200, 'Purpose cannot exceed 200 characters']
  },
  numberOfStudents: {
    type: Number,
    min: [1, 'Number of students must be at least 1'],
    max: [50, 'Number of students cannot exceed 50'],
    default: 1
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
studyAreaBookingSchema.index({ user: 1, date: 1 });
studyAreaBookingSchema.index({ studyArea: 1, date: 1, day: 1 });
studyAreaBookingSchema.index({ date: 1, day: 1, startNum: 1, endNum: 1 });
studyAreaBookingSchema.index({ status: 1 });
studyAreaBookingSchema.index({ createdAt: -1 });

// Compound index to prevent double bookings for same study area
studyAreaBookingSchema.index({
  studyArea: 1,
  date: 1,
  day: 1,
  startNum: 1,
  endNum: 1,
  status: 1
});

// Virtual for duration in hours
studyAreaBookingSchema.virtual('duration').get(function() {
  return (this.endNum - this.startNum);
});

// Virtual for booking period display
studyAreaBookingSchema.virtual('timeSlot').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});

// Pre-save middleware to ensure end time is after start time
studyAreaBookingSchema.pre('save', function(next) {
  if (this.endNum <= this.startNum) {
    return next(new Error('End time must be after start time'));
  }
  
  // Set day from date if not provided
  if (!this.day && this.date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.day = days[this.date.getDay()];
  }
  
  next();
});

// Static method to check for booking conflicts
studyAreaBookingSchema.statics.findConflicts = async function(studyAreaId, date, day, startNum, endNum, excludeBookingId = null) {
  const query = {
    studyArea: studyAreaId,
    date: new Date(date.setHours(0, 0, 0, 0)),
    day: day,
    status: { $in: ['confirmed', 'completed'] },
    $or: [
      // New booking starts during an existing booking
      { startNum: { $lt: startNum }, endNum: { $gt: startNum } },
      // New booking ends during an existing booking
      { startNum: { $lt: endNum }, endNum: { $gt: endNum } },
      // New booking completely contains an existing booking
      { startNum: { $gte: startNum }, endNum: { $lte: endNum } },
      // Existing booking completely contains the new booking
      { startNum: { $lte: startNum }, endNum: { $gte: endNum } }
    ]
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  return await this.find(query);
};

// Static method to get user's bookings
studyAreaBookingSchema.statics.getUserBookings = async function(userId, options = {}) {
  const { status, startDate, endDate, page = 1, limit = 10 } = options;
  
  const query = { user: userId };
  
  if (status) {
    query.status = status;
  }
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  const skip = (page - 1) * limit;
  
  const bookings = await this.find(query)
    .populate('studyArea', 'name location capacity')
    .sort({ date: 1, startNum: 1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await this.countDocuments(query);
  
  return {
    bookings,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  };
};

module.exports = mongoose.model('StudyAreaBooking', studyAreaBookingSchema);
