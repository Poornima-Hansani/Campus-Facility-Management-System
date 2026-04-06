// backend/routes/timetableRoutes.js

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Timetable = require('../models/Timetable');
const LabTimetable = require('../models/LabTimetable');

// ================= GET ALL COMPLETED TIMETABLES =================
router.get('/', async (req, res) => {
  try {
    const timetables = await Timetable.find({ status: 'completed' })
      .populate('days.slots.lecturer', 'name email')
      .sort({ createdAt: -1 });

    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= GET BY ID =================
router.get('/:id', async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('days.slots.lecturer', 'name email');

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= CREATE =================
router.post('/', async (req, res) => {
  try {
    req.body.status = 'completed';

    const timetable = new Timetable(req.body);

    for (const day of timetable.days) {
      for (const slot of day.slots) {
        if (!mongoose.Types.ObjectId.isValid(slot.lecturer)) {
          return res.status(400).json({
            message: `Invalid lecturer ID at ${day.day}`,
          });
        }
      }
    }

    const saved = await timetable.save();

    // Update lab timetable
    for (const day of saved.days) {
      for (const slot of day.slots) {
        await LabTimetable.findOneAndUpdate(
          { labNumber: slot.labNumber },
          {
            $push: {
              slots: {
                day: day.day,
                startTime: slot.startTime,
                endTime: slot.endTime,
                status: 'occupied',
                title: saved.title,
                lecturer: slot.lecturer,
              },
            },
          },
          { upsert: true, new: true }
        );
      }
    }

    const populated = await Timetable.findById(saved._id)
      .populate('days.slots.lecturer', 'name email');

    res.status(201).json(populated);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ================= UPDATE =================
router.put('/:id', async (req, res) => {
  try {
    req.body.status = 'completed';

    const updated = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('days.slots.lecturer', 'name email');

    if (!updated) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    res.json(updated);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ================= DELETE =================
router.delete('/:id', async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: 'Timetable deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;