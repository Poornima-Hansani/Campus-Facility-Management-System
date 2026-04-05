const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) =>
  jwt.sign({ id }, 'secretkey', { expiresIn: '30d' });

exports.register = async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      data: {
        user,
        token: generateToken(user._id)
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.password = undefined;

    res.json({
      data: {
        user,
        token: generateToken(user._id)
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};