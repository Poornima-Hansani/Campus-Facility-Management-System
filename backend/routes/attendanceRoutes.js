const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Mark attendance
router.post('/', async (req, res) => {
  try {
    const { studentName, studentId, module, date } = req.body;
    
    if (!studentName || !studentId || !module || !date) {
      return res.status(400).json({ error: 'Student Name, ID, Module, and Date are required' });
    }

    // Optional: check if already submitted
    const existing = await Attendance.findOne({ studentId, module, date });
    if (existing) {
      return res.status(400).json({ error: 'Attendance already marked for this module today' });
    }

    const newAttendance = new Attendance({
      studentName,
      studentId,
      module,
      date
    });

    await newAttendance.save();
    res.status(201).json(newAttendance);
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Get attendance records
router.get('/', async (req, res) => {
  try {
    const { module, date } = req.query;
    let query = {};
    if (module) query.module = module;
    if (date) query.date = date;
    
    const records = await Attendance.find(query).sort({ scannedAt: -1 });
    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

module.exports = router;
