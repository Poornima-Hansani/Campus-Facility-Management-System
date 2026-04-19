const mongoose = require('mongoose');

const studyAreaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Study area name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [500, 'Capacity cannot exceed 500'],
    default: 30
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  amenities: [{
    type: String,
    trim: true,
    maxlength: [100, 'Amenity name cannot exceed 100 characters']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
studyAreaSchema.index({ name: 1 });
studyAreaSchema.index({ location: 1 });
studyAreaSchema.index({ isActive: 1 });
studyAreaSchema.index({ capacity: 1 });

// Virtual for availability status
studyAreaSchema.virtual('isAvailable').get(function() {
  return this.isActive;
});

module.exports = mongoose.model('StudyArea', studyAreaSchema);
