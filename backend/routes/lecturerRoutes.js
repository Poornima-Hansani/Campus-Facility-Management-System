const express = require('express');
const router = express.Router();
const Lecturer = require('../models/Lecturer');

// Get all lecturers
router.get('/', async (req, res) => {
  try {
    const data = await Lecturer.find().sort({ name: 1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lecturers', error: error.message });
  }
});

// Create new lecturer
router.post('/', async (req, res) => {
  try {
    const data = await Lecturer.create(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error creating lecturer', error: error.message });
  }
});

module.exports = router;
