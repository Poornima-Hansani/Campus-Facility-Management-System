const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get REAL lecturers from users collection
router.get('/', async (req, res) => {
  try {
    const lecturers = await User.find(
      { role: 'lecturer' },
      { _id: 1, name: 1, moduleCode: 1, moduleName: 1 } // include module info
    );

    res.json(lecturers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
