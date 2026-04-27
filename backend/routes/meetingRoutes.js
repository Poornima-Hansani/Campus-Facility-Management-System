const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create meeting
router.post('/', async (req, res) => {
  try {
    const { meetingId, title, date, startTime, endTime, location, description, conductor, conductorId } = req.body;
    
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
      conductor,
      conductorId
    });

    await newMeeting.save();
    
    // Create notification for the conducting lecturer
    try {
      // Find lecturer by userId
      let lecturer = await User.findOne({ userId: conductorId, role: 'lecturer' });
      if (!lecturer) {
        // Try by MongoDB _id
        lecturer = await User.findById(conductorId);
      }
      
      if (lecturer) {
        const notification = new Notification({
          type: 'meeting_scheduled',
          recipientType: 'lecturer',
          recipientId: lecturer.userId || conductorId,
          message: `You have been assigned to conduct a meeting: "${title}" on ${date} at ${startTime}`,
          meetingId: newMeeting._id,
          title,
          date,
          startTime,
          endTime,
          location,
          createdAt: new Date().toISOString(),
          read: false
        });
        await notification.save();
      }
    } catch (notifErr) {
      console.error('Failed to create meeting notification:', notifErr);
    }
    
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
