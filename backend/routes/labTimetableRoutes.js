const express = require('express');
const router = express.Router();
const LabTimetable = require('../models/LabTimetable');
const StudentTimeTable = require('../models/StudentTimeTable');
const User = require('../models/User');

// Helper function to calculate free time for a lab
const calculateLabFreeTime = (busySessions) => {
  const free = [];
  let currentTime = 8.0; // Start of working hours
  const workingEnd = 20.0; // Labs work 8:00 - 20:00 daily
  
  // Sort busy sessions by start time
  busySessions.sort((a, b) => a.start - b.start);
  
  for (const session of busySessions) {
    // Add free time before this session
    if (currentTime < session.start) {
      free.push({
        start: currentTime,
        end: session.start
      });
    }
    // Update current time to end of this session
    currentTime = Math.max(currentTime, session.end);
  }
  
  // Add free time after last session
  if (currentTime < workingEnd) {
    free.push({
      start: currentTime,
      end: workingEnd
    });
  }
  
  // If no sessions, entire working day is free
  if (busySessions.length === 0) {
    free.push({
      start: 8.0,
      end: 20.0
    });
  }
  
  return free;
};

// Main function to rebuild lab timetables from StudentTimeTable
const rebuildLabTimetables = async () => {
  try {
    console.log('Starting LabTimetable rebuild...');
    
    // Step 1: Fetch all student timetables with populated lecturer data
    const studentTimetables = await StudentTimeTable.find()
      .populate('sessions.lecturer', 'name');
    
    // Step 2: Group all LAB sessions by location
    const labSessions = {};
    
    studentTimetables.forEach(timetable => {
      timetable.sessions.forEach(session => {
        if (session.type === 'LAB' && session.location) {
          const labName = session.location;
          
          if (!labSessions[labName]) {
            labSessions[labName] = [];
          }
          
          labSessions[labName].push({
            start: session.startNum,
            end: session.endNum,
            year: timetable.year,
            semester: timetable.semester,
            batch: timetable.batch,
            specialization: timetable.specialization,
            group: timetable.group,
            lecturerName: session.lecturer?.name || 'Unknown',
            subject: session.subject,
            day: session.day
          });
        }
      });
    });
    
    // Step 3: For each lab, organize sessions by day and calculate free time
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (const [labName, sessions] of Object.entries(labSessions)) {
      // Initialize days structure
      const daysData = {};
      
      days.forEach(day => {
        // Get sessions for this day
        const daySessions = sessions.filter(s => s.day === day);
        
        // Create busy slots
        const busy = daySessions.map(s => ({
          start: s.start,
          end: s.end,
          year: s.year,
          semester: s.semester,
          batch: s.batch,
          specialization: s.specialization,
          group: s.group,
          lecturerName: s.lecturerName,
          subject: s.subject
        }));
        
        // Calculate free slots
        const free = calculateLabFreeTime(busy);
        
        daysData[day] = { busy, free };
      });
      
      // Step 4: Upsert lab timetable
      await LabTimetable.findOneAndUpdate(
        { labName },
        {
          labName,
          days: daysData,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
      
      console.log(`Processed lab: ${labName} with ${sessions.length} sessions`);
    }
    
    console.log('LabTimetable rebuild completed successfully');
    return { success: true, message: 'LabTimetable rebuilt successfully' };
    
  } catch (error) {
    console.error('Error rebuilding LabTimetable:', error);
    throw error;
  }
};

// GET /api/labtimetables - Get all lab timetables
router.get('/', async (req, res) => {
  try {
    const labTimetables = await LabTimetable.find().sort({ labName: 1 });
    res.json(labTimetables);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching lab timetables', 
      error: error.message 
    });
  }
});

// GET /api/labtimetables/:labName - Get specific lab timetable
router.get('/:labName', async (req, res) => {
  try {
    const labTimetable = await LabTimetable.findOne({ 
      labName: req.params.labName 
    });
    
    if (!labTimetable) {
      return res.status(404).json({ 
        message: 'Lab timetable not found' 
      });
    }
    
    res.json(labTimetable);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching lab timetable', 
      error: error.message 
    });
  }
});

// POST /api/labtimetables/rebuild - Rebuild all lab timetables
router.post('/rebuild', async (req, res) => {
  try {
    const result = await rebuildLabTimetables();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error rebuilding lab timetables', 
      error: error.message 
    });
  }
});

// GET /api/labtimetables/:labName/availability - Get availability for a specific lab
router.get('/:labName/availability', async (req, res) => {
  try {
    const { day } = req.query;
    
    const labTimetable = await LabTimetable.findOne({ 
      labName: req.params.labName 
    });
    
    if (!labTimetable) {
      return res.status(404).json({ 
        message: 'Lab timetable not found' 
      });
    }
    
    if (day && labTimetable.days[day]) {
      // Return specific day availability
      res.json({
        labName: labTimetable.labName,
        day: day,
        busy: labTimetable.days[day].busy,
        free: labTimetable.days[day].free
      });
    } else {
      // Return all days availability
      res.json({
        labName: labTimetable.labName,
        days: labTimetable.days
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching lab availability', 
      error: error.message 
    });
  }
});

// Export the router for Express app
module.exports = router;

// Also export rebuildLabTimetables separately for use in other routes
module.exports.rebuildLabTimetables = rebuildLabTimetables;