const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// Get all locations
router.get('/', async (req, res) => {
  try {
    const data = await Location.find().sort({ name: 1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations', error: error.message });
  }
});

// Create new location
router.post('/', async (req, res) => {
  try {
    const data = await Location.create(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error creating location', error: error.message });
  }
});

module.exports = router;
