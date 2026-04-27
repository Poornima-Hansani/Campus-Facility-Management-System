const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');

// Create meeting
router.post('/', async (req, res) => {
  try {
    const { meetingId, title, date, startTime, endTime, location, description, conductor } = req.body;
    
    if (!meetingId || !title || !date || !startTime || !endTime || !location || !description || !conductor) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newMeeting = new Meeting({
      meetingId,
      title,
      date,
      startTime,
      endTime,
      location,
      description,
      conductor
    });

    await newMeeting.save();
    res.status(201).json(newMeeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// Get all meetings
router.get('/', async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ createdAt: -1 });
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

module.exports = router;
