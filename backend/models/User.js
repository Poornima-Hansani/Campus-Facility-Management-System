const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ['student', 'lecturer', 'management', 'staff', 'admin'] },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },

  // Optional dynamic fields based on role
  // -- student
  phone: String,
  faculty: String,
  year: String,
  semester: String,
  scheduleType: String,
  specialization: String,

  // -- lecturer
  moduleCode: String,
  moduleName: String,
  department: String,

  // -- staff
  jobType: String

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
