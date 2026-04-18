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

// Admin endpoint to get weekly confirmation report
router.get('/admin/weekly-report', async (req, res) => {
  try {
    const LabFreeGapAlert = require('../models/LabFreeGapAlert');
    const { weekNumber, year } = req.query;
    
    // Get current week and year if not provided
    const currentWeek = weekNumber ? parseInt(weekNumber) : getCurrentWeek();
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    // Build query for specific week or all weeks
    const query = weekNumber && year 
      ? { weekNumber: currentWeek, year: currentYear }
      : {};
    
    const alerts = await LabFreeGapAlert.find(query)
      .sort({ weekNumber: -1, year: -1, labName: 1, day: 1, start: 1 });
    
    // Group by week and then by lab
    const weeklyReport = {};
    alerts.forEach(alert => {
      const weekKey = `Week ${alert.weekNumber} - ${alert.year}`;
      
      if (!weeklyReport[weekKey]) {
        weeklyReport[weekKey] = {
          weekNumber: alert.weekNumber,
          year: alert.year,
          labs: {},
          totalAlerts: 0,
          confirmedAlerts: 0,
          pendingAlerts: 0
        };
      }
      
      const weekData = weeklyReport[weekKey];
      weekData.totalAlerts++;
      
      // Group by lab
      if (!weekData.labs[alert.labName]) {
        weekData.labs[alert.labName] = {
          labName: alert.labName,
          confirmedAlerts: [],
          pendingAlerts: [],
          totalConfirmed: 0,
          totalPending: 0
        };
      }
      
      const labData = weekData.labs[alert.labName];
      
      if (alert.confirmed) {
        weekData.confirmedAlerts++;
        labData.confirmedAlerts.push({
          lecturerName: alert.lecturerName,
          lecturerId: alert.lecturerId,
          day: alert.day,
          timeSlot: `${alert.start}:00-${alert.end}:00`,
          confirmedAt: alert.confirmedAt,
          duration: alert.duration
        });
        labData.totalConfirmed++;
      } else {
        weekData.pendingAlerts++;
        labData.pendingAlerts.push({
          lecturerName: alert.lecturerName,
          lecturerId: alert.lecturerId,
          day: alert.day,
          timeSlot: `${alert.start}:00-${alert.end}:00`,
          createdAt: alert.createdAt,
          duration: alert.duration
        });
        labData.totalPending++;
      }
    });
    
    // Convert labs object to array for easier frontend processing
    const formattedReport = Object.keys(weeklyReport).map(weekKey => ({
      weekKey,
      ...weeklyReport[weekKey],
      labs: Object.values(weeklyReport[weekKey].labs)
    }));
    
    res.json({
      report: formattedReport,
      currentWeek: getCurrentWeek(),
      currentYear: new Date().getFullYear(),
      summary: {
        totalWeeks: formattedReport.length,
        totalAlerts: alerts.length,
        totalConfirmed: alerts.filter(a => a.confirmed).length,
        totalPending: alerts.filter(a => !a.confirmed).length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoint to get student timetables (sessions only)
router.get('/admin/student-timetables', async (req, res) => {
  try {
    const StudentTimeTable = require('../models/StudentTimeTable');
    const { year, semester, batch, specialization, group } = req.query;
    
    // Build query based on filters
    const query = {};
    if (year) query.year = year;
    if (semester) query.semester = semester;
    if (batch) query.batch = batch;
    if (specialization) query.specialization = specialization;
    if (group) query.group = group;
    
    const timetables = await StudentTimeTable.find(query)
      .sort({ year: -1, semester: -1, batch: 1, specialization: 1, group: 1 })
      .populate('sessions.lecturer', 'name userId');
    
    // Extract only session data (no free time gaps)
    const sessionData = timetables.map(timetable => ({
      year: timetable.year,
      semester: timetable.semester,
      batch: timetable.batch,
      specialization: timetable.specialization,
      group: timetable.group,
      sessions: timetable.sessions.map(session => ({
        sessionId: session.sessionId,
        day: session.day,
        startTime: session.startTime,
        endTime: session.endTime,
        type: session.type,
        subject: session.subject,
        lecturer: session.lecturer,
        location: session.location
      })),
      totalSessions: timetable.sessions.length
    }));
    
    // Group by year/semester/batch/specialization
    const groupedData = {};
    sessionData.forEach(item => {
      const key = `${item.year} - ${item.semester} - ${item.batch} - ${item.specialization}`;
      
      if (!groupedData[key]) {
        groupedData[key] = {
          year: item.year,
          semester: item.semester,
          batch: item.batch,
          specialization: item.specialization,
          groups: []
        };
      }
      
      groupedData[key].groups.push({
        group: item.group,
        sessions: item.sessions,
        totalSessions: item.totalSessions
      });
    });
    
    res.json({
      timetables: Object.values(groupedData),
      totalTimetables: timetables.length,
      summary: {
        years: [...new Set(timetables.map(t => t.year))],
        semesters: [...new Set(timetables.map(t => t.semester))],
        batches: [...new Set(timetables.map(t => t.batch))],
        specializations: [...new Set(timetables.map(t => t.specialization))]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get current week
function getCurrentWeek() {
  const now = new Date();
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

module.exports = router;
