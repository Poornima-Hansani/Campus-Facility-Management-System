const express = require('express');
const router = express.Router();
const StudyArea = require('../models/StudyArea');

// CREATE study area
router.post('/', async (req, res) => {
  try {
    const area = new StudyArea(req.body);
    await area.save();
    res.status(201).json(area);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET all study areas
router.get('/', async (req, res) => {
  try {
    const areas = await StudyArea.find().sort({ createdAt: -1 });
    res.json(areas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE study area
router.delete('/:id', async (req, res) => {
  try {
    await StudyArea.findByIdAndDelete(req.params.id);
    res.json({ message: 'Study area deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;