const mongoose = require('mongoose');

const studyAreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, default: 20 },
  location: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('StudyArea', studyAreaSchema);