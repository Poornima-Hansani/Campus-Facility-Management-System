const mongoose = require('mongoose');

const studyAreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true, default: 30 },
  description: { type: String, default: '' },
  amenities: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('StudyArea', studyAreaSchema);
