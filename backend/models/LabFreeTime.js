const mongoose = require('mongoose');

const freeTimeSlotSchema = new mongoose.Schema({
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
    enum: ['free', 'available', 'maintenance'],
    default: 'free',
  },
  // Reason for free time (optional)
  reason: {
    type: String,
    default: 'Available',
  },
  // Priority level for booking
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  // Maximum duration for bookings in this slot
  maxBookingDuration: {
    type: Number, // in hours
    default: 2,
  },
  // Whether this slot is bookable
  isBookable: {
    type: Boolean,
    default: true,
  }
});

const labFreeTimeSchema = new mongoose.Schema(
  {
    labNumber: { 
      type: String, 
      required: true,
      unique: true,
      set: v => v.startsWith('Lab') ? v : `Lab${v}` 
    },
    // Lab operating hours for each day
    operatingHours: {
      Monday: { open: String, close: String },
      Tuesday: { open: String, close: String },
      Wednesday: { open: String, close: String },
      Thursday: { open: String, close: String },
      Friday: { open: String, close: String },
      Saturday: { open: String, close: String },
      Sunday: { open: String, close: String },
    },
    // Default operating hours if not specified per day
    defaultOperatingHours: {
      weekdays: { open: { type: String, default: '08:00' }, close: { type: String, default: '22:00' } },
      weekends: { open: { type: String, default: '08:00' }, close: { type: String, default: '20:00' } },
    },
    // Free time slots for this lab
    freeTimeSlots: [freeTimeSlotSchema],
    // Last updated timestamp
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    // Auto-generation settings
    autoGenerate: {
      type: Boolean,
      default: true,
    },
    // Break times (lunch, etc.)
    breakTimes: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      startTime: String,
      endTime: String,
      reason: {
        type: String,
        default: 'Break time',
      }
    }],
    // Status of this lab free time schedule
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

// Indexes for better query performance
labFreeTimeSchema.index({ 'freeTimeSlots.day': 1 });
labFreeTimeSchema.index({ 'freeTimeSlots.startTime': 1 });

// Method to get free slots for a specific day
labFreeTimeSchema.methods.getFreeSlotsForDay = function(day) {
  return this.freeTimeSlots.filter(slot => slot.day === day && slot.isBookable);
};

// Method to get all free slots grouped by day
labFreeTimeSchema.methods.getAllFreeSlotsGrouped = function() {
  const grouped = {};
  
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => {
    const daySlots = this.getFreeSlotsForDay(day);
    if (daySlots.length > 0) {
      grouped[day] = daySlots;
    }
  });
  
  return grouped;
};

// Method to check if a time slot is available
labFreeTimeSchema.methods.isTimeSlotAvailable = function(day, startTime, endTime) {
  const daySlots = this.getFreeSlotsForDay(day);
  
  return daySlots.some(slot => {
    const slotStart = new Date(`2000-01-01 ${slot.startTime}`);
    const slotEnd = new Date(`2000-01-01 ${slot.endTime}`);
    const requestStart = new Date(`2000-01-01 ${startTime}`);
    const requestEnd = new Date(`2000-01-01 ${endTime}`);
    
    return requestStart >= slotStart && requestEnd <= slotEnd;
  });
};

// Method to generate free time slots automatically based on operating hours and occupied slots
labFreeTimeSchema.methods.generateFreeSlots = function(occupiedSlots) {
  const freeSlots = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  days.forEach(day => {
    // Get operating hours for this day
    let operatingHours = this.operatingHours[day];
    if (!operatingHours || !operatingHours.open || !operatingHours.close) {
      // Use default operating hours
      operatingHours = ['Saturday', 'Sunday'].includes(day) 
        ? this.defaultOperatingHours.weekends 
        : this.defaultOperatingHours.weekdays;
    }
    
    if (!operatingHours.open || !operatingHours.close) return;
    
    // Get occupied slots for this day
    const dayOccupied = occupiedSlots.filter(slot => slot.day === day);
    
    // Generate free slots by finding gaps between occupied slots
    const dayStart = new Date(`2000-01-01 ${operatingHours.open}`);
    const dayEnd = new Date(`2000-01-01 ${operatingHours.close}`);
    
    // Sort occupied slots by start time
    dayOccupied.sort((a, b) => new Date(`2000-01-01 ${a.startTime}`) - new Date(`2000-01-01 ${b.startTime}`));
    
    let currentTime = new Date(dayStart);
    
    dayOccupied.forEach(occupied => {
      const occupiedStart = new Date(`2000-01-01 ${occupied.startTime}`);
      const occupiedEnd = new Date(`2000-01-01 ${occupied.endTime}`);
      
      // Add free slot before occupied slot if there's a gap
      if (currentTime < occupiedStart) {
        const duration = (occupiedStart - currentTime) / (1000 * 60 * 60);
        if (duration >= 4) { // Minimum 4 hours
          freeSlots.push({
            day: day,
            startTime: currentTime.toTimeString().slice(0, 5),
            endTime: occupiedStart.toTimeString().slice(0, 5),
            status: 'free',
            reason: 'Available',
            priority: 'medium',
            isBookable: true
          });
        }
      }
      
      // Move current time to end of occupied slot
      if (occupiedEnd > currentTime) {
        currentTime = new Date(occupiedEnd);
      }
    });
    
    // If no occupied slots for this day, the whole day is free
    if (dayOccupied.length === 0) {
      freeSlots.push({
        day: day,
        startTime: operatingHours.open,
        endTime: operatingHours.close,
        status: 'free',
        reason: 'Available all day',
        priority: 'high',
        isBookable: true
      });
    } else {
      // Add free slot after last occupied slot if there's time remaining
      if (currentTime < dayEnd) {
        const duration = (dayEnd - currentTime) / (1000 * 60 * 60);
        if (duration >= 4) { // Minimum 4 hours
          freeSlots.push({
            day: day,
            startTime: currentTime.toTimeString().slice(0, 5),
            endTime: dayEnd.toTimeString().slice(0, 5),
            status: 'free',
            reason: 'Available',
            priority: 'medium',
            isBookable: true
          });
        }
      }
    }
  });
  
  this.freeTimeSlots = freeSlots;
  this.lastUpdated = new Date();
  return this;
};


module.exports = mongoose.model('LabFreeTime', labFreeTimeSchema);
