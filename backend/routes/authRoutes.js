const express = require('express');
const router = express.Router();
const User = require('../models/User');

const generateId = (role) => {
  const random = Math.floor(1000 + Math.random() * 9000);
  switch (role) {
    case "student":
      return "ST" + random;
    case "lecturer":
      return "LEC" + random;
    case "staff":
      return "STF" + random;
    case "management":
      return "MNG" + random;
    case "admin":
      return "ADM" + random;
    default:
      return "USR" + random;
  }
};

// @route   POST /api/auth/register
// @desc    Register user and generate ID dynamically by role
router.post('/register', async (req, res) => {
  try {
    const { role, name, email, password, ...rest } = req.body;

    if (!role || !name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required basic fields." });
    }

    const id = generateId(role);

    const newUser = new User({
      userId: id,
      role,
      name,
      email,
      password, // Intentionally plain text as per base requirements. Add bcrypt later if necessary
      ...rest
    });

    await newUser.save();

    res.status(201).json({ message: "Registered successfully", userId: id });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// @route   POST /api/auth/login
// @desc    Login user using UserID + password
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: "Please provide User ID and Password." });
    }

    const user = await User.findOne({ userId });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid User ID or password." });
    }

    res.json({
      userId: user.userId,
      role: user.role,
      name: user.name,
      phone: user.phone,
      faculty: user.faculty,
      year: user.year,
      semester: user.semester,
      scheduleType: user.scheduleType,
      specialization: user.specialization
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

module.exports = router;
