const mongoose = require('mongoose');

const lecturerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }, // e.g LEC001
  department: String
});

module.exports = mongoose.model('Lecturer', lecturerSchema);
