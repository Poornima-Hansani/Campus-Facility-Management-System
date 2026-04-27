const mongoose = require('mongoose');

const lectureNoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  module: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LectureNote', lectureNoteSchema);
