const express = require('express');
const router = express.Router();
const service = require('../services/labFreeGapService');

// Run calculation manually
router.get('/calculate', async (req, res) => {
  try {
    await service.calculateGaps();
    res.json({ message: "Calculated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lecturer alerts
router.get('/alerts/:lecturerId', async (req, res) => {
  try {
    const alerts = await service.getAlertsForLecturer(req.params.lecturerId);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm alert
router.post('/confirm/:alertId', async (req, res) => {
  try {
    const success = await service.confirmAlert(req.params.alertId);
    if (success) {
      res.json({ message: "Alert confirmed successfully" });
    } else {
      res.status(404).json({ error: "Alert not found or already confirmed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check LabTimetable data
router.get('/debug', async (req, res) => {
  try {
    const LabTimetable = require('../models/LabTimetable');
    const labs = await LabTimetable.find({});
    
    const debugInfo = {
      totalLabs: labs.length,
      labs: labs.map(lab => ({
        labName: lab.labName,
        hasDays: !!lab.days,
        daysStructure: lab.days ? Object.keys(lab.days) : [],
        daysWithBusy: Object.keys(lab.days || {}).filter(day => lab.days[day].busy && lab.days[day].busy.length > 0),
        detailedDays: lab.days ? Object.keys(lab.days).map(day => ({
          day,
          hasBusy: !!lab.days[day].busy,
          hasFree: !!lab.days[day].free,
          busyCount: lab.days[day].busy ? lab.days[day].busy.length : 0,
          freeCount: lab.days[day].free ? lab.days[day].free.length : 0,
          busySlots: lab.days[day].busy || [],
          freeSlots: lab.days[day].free || []
        })) : []
      }))
    };
    
    res.json(debugInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all alerts endpoint
router.delete('/clear', async (req, res) => {
  try {
    const LabFreeGapAlert = require('../models/LabFreeGapAlert');
    await LabFreeGapAlert.deleteMany({});
    res.json({ message: "All alerts cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoint to get all alerts with lecturer information
router.get('/admin/all-alerts', async (req, res) => {
  try {
    const LabFreeGapAlert = require('../models/LabFreeGapAlert');
    const alerts = await LabFreeGapAlert.find({})
      .sort({ weekNumber: -1, year: -1, day: 1, start: 1 });
    
    // Group alerts by lecturer
    const alertsByLecturer = {};
    alerts.forEach(alert => {
      const lecturerId = alert.lecturerId;
      if (!alertsByLecturer[lecturerId]) {
        alertsByLecturer[lecturerId] = {
          lecturerId,
          lecturerName: alert.lecturerName,
          totalAlerts: 0,
          confirmedAlerts: 0,
          pendingAlerts: 0,
          alerts: []
        };
      }
      
      alertsByLecturer[lecturerId].totalAlerts++;
      alertsByLecturer[lecturerId].alerts.push(alert);
      
      if (alert.confirmed) {
        alertsByLecturer[lecturerId].confirmedAlerts++;
      } else {
        alertsByLecturer[lecturerId].pendingAlerts++;
      }
    });
    
    const summary = Object.values(alertsByLecturer);
    
    res.json({
      summary,
      totalAlerts: alerts.length,
      totalConfirmed: alerts.filter(a => a.confirmed).length,
      totalPending: alerts.filter(a => !a.confirmed).length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
