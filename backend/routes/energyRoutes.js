const express = require('express');
const router = express.Router();
const TimetableSession = require('../models/TimetableSession');
const LabBooking = require('../models/LabBooking');
const LabFreeTime = require('../models/LabFreeTime');
const EnergyNotification = require('../models/EnergyNotification');

function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function timeToStr(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getDayName(dateStr) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(dateStr).getDay()];
}

router.post('/calculate-free-times', async (req, res) => {
  try {
    const { date } = req.body;
    const day = getDayName(date);
    
    const timetable = await TimetableSession.find({ 
      venueName: { $regex: /^[A-Z]\d{3}$/i },
      day: day
    });
    
    const bookings = await LabBooking.find({
      date,
      status: { $in: ['Confirmed', 'Pending'] }
    });
    
    const labSchedule = {};
    timetable.forEach(session => {
      const lab = session.venueName.toUpperCase();
      if (!labSchedule[lab]) labSchedule[lab] = [];
      labSchedule[lab].push({
        startTime: session.startTime,
        endTime: session.endTime,
        lecturer: session.lecturer
      });
    });
    
    const labBookings = {};
    bookings.forEach(booking => {
      const lab = booking.labId.toUpperCase();
      if (!labBookings[lab]) labBookings[lab] = [];
      labBookings[lab].push({
        startTime: booking.startTime,
        endTime: booking.endTime
      });
    });
    
    await LabFreeTime.deleteMany({ date, day });
    
    const dayStart = 8 * 60;
    const dayEnd = 20 * 60;
    const freeTimes = [];
    const energyRisks = [];
    
    for (const [lab, sessions] of Object.entries(labSchedule)) {
      const sortedSessions = sessions
        .map(s => ({
          start: parseTime(s.startTime),
          end: parseTime(s.endTime),
          lecturer: s.lecturer
        }))
        .sort((a, b) => a.start - b.start);
      
      let freeSlots = [];
      let currentTime = dayStart;
      
      for (const session of sortedSessions) {
        if (currentTime < session.start) {
          freeSlots.push({
            start: currentTime,
            end: session.start,
            lecturer: session.lecturer
          });
        }
        currentTime = Math.max(currentTime, session.end);
      }
      
      if (currentTime < dayEnd) {
        freeSlots.push({
          start: currentTime,
          end: dayEnd,
          lecturer: sortedSessions.length > 0 ? sortedSessions[sortedSessions.length - 1].lecturer : ''
        });
      }
      
      const labBookingsForDay = labBookings[lab] || [];
      
      for (const free of freeSlots) {
        let remainingStart = free.start;
        
        for (const booking of labBookingsForDay) {
          const bStart = parseTime(booking.startTime);
          const bEnd = parseTime(booking.endTime);
          
          if (bStart >= remainingStart) continue;
          if (bEnd <= remainingStart) continue;
          
          if (bStart > remainingStart) {
            remainingStart = bEnd;
          } else {
            remainingStart = Math.max(remainingStart, bEnd);
          }
        }
        
        if (remainingStart < free.end) {
          const duration = Math.floor((free.end - remainingStart) / 60);
          const isEnergyWaste = duration > 4;
          
          const labFreeTime = new LabFreeTime({
            lab,
            day,
            date,
            startTime: timeToStr(remainingStart),
            endTime: timeToStr(free.end),
            duration,
            isEnergyWaste,
            lecturerId: free.lecturer || '',
            lecturerName: free.lecturer || '',
            confirmed: false,
            notified: false
          });
          
          await labFreeTime.save();
          freeTimes.push(labFreeTime);
          
          if (isEnergyWaste) {
            energyRisks.push(labFreeTime);
          }
        }
      }
    }
    
    res.json({ 
      message: 'Free times calculated',
      freeTimes: freeTimes.length,
      energyRisks: energyRisks.length,
      energyRisks: energyRisks
    });
  } catch (error) {
    console.error('Error calculating free times:', error);
    res.status(500).json({ error: 'Failed to calculate free times' });
  }
});

router.post('/check-energy-risks', async (req, res) => {
  try {
    const { date } = req.body;
    const day = getDayName(date);
    
    const energyRisks = await LabFreeTime.find({
      date,
      day,
      isEnergyWaste: true,
      confirmed: false
    });
    
    const notifications = [];
    
    for (const freeTime of energyRisks) {
      if (!freeTime.notified && freeTime.lecturerName) {
        const notification = new EnergyNotification({
          lab: freeTime.lab,
          labName: freeTime.lab,
          lecturerId: freeTime.lecturerId,
          lecturerName: freeTime.lecturerName,
          message: `Please turn off AC and lights in lab ${freeTime.lab} on ${day} from ${freeTime.startTime} to ${freeTime.endTime} (${freeTime.duration} hours of idle time)`,
          status: 'pending',
          date,
          freeTimeId: freeTime._id
        });
        
        await notification.save();
        
        freeTime.notified = true;
        await freeTime.save();
        
        notifications.push(notification);
      }
    }
    
    res.json({
      message: 'Energy risks checked',
      notificationsCreated: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Error checking energy risks:', error);
    res.status(500).json({ error: 'Failed to check energy risks' });
  }
});

router.get('/notifications/:lecturerId', async (req, res) => {
  try {
    const { lecturerId } = req.params;
    const notifications = await EnergyNotification.find({ lecturerId })
      .sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.put('/confirm-notification/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await EnergyNotification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notification.status = 'confirmed';
    await notification.save();
    
    if (notification.freeTimeId) {
      await LabFreeTime.findByIdAndUpdate(notification.freeTimeId, { confirmed: true });
    }
    
    res.json({ message: 'Notification confirmed', notification });
  } catch (error) {
    console.error('Error confirming notification:', error);
    res.status(500).json({ error: 'Failed to confirm notification' });
  }
});

router.get('/energy-waste', async (req, res) => {
  try {
    const { date } = req.query;
    const query = { isEnergyWaste: true, confirmed: false };
    if (date) {
      query.date = date;
    }
    
    const energyWaste = await LabFreeTime.find(query).sort({ date: -1 });
    res.json({ energyWaste });
  } catch (error) {
    console.error('Error fetching energy waste:', error);
    res.status(500).json({ error: 'Failed to fetch energy waste data' });
  }
});

router.get('/free-times', async (req, res) => {
  try {
    const { date, lab } = req.query;
    const query = {};
    if (date) query.date = date;
    if (lab) query.lab = lab.toUpperCase();
    
    const freeTimes = await LabFreeTime.find(query).sort({ lab: 1, startTime: 1 });
    res.json({ freeTimes });
  } catch (error) {
    console.error('Error fetching free times:', error);
    res.status(500).json({ error: 'Failed to fetch free times' });
  }
});

router.post('/process-daily', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const day = getDayName(today);
    
    const pendingNotifications = await EnergyNotification.find({
      status: 'pending',
      date: { $lt: today }
    });
    
    for (const notification of pendingNotifications) {
      notification.status = 'expired';
      await notification.save();
      
      if (notification.freeTimeId) {
        await LabFreeTime.findByIdAndUpdate(notification.freeTimeId, {
          isEnergyWaste: true
        });
      }
    }
    
    res.json({
      message: 'Daily processing completed',
      expiredCount: pendingNotifications.length
    });
  } catch (error) {
    console.error('Error in daily processing:', error);
    res.status(500).json({ error: 'Failed to process daily energy check' });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    const { status, date } = req.query;
    const query = {};
    if (status) query.status = status;
    if (date) query.date = date;
    
    const notifications = await EnergyNotification.find(query).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;