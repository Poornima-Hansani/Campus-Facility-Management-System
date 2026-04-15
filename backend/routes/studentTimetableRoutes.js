const express = require('express');
const router = express.Router();
const StudentTimeTable = require('../models/StudentTimeTable');

// Professional time conversion function
const timeToNumber = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h + (m === 30 ? 0.5 : 0);
};

router.post('/', async (req, res) => {
  try {
    const { year, semester, batch, specialization, group, sessions } = req.body;
    
    // Validate all sessions before processing
    for (const s of sessions) {
      const startNum = timeToNumber(s.startTime);
      const endNum = timeToNumber(s.endTime);
      
      if (endNum <= startNum) {
        return res.status(400).json({
          message: `Invalid time range on ${s.day}: ${s.startTime} must be before ${s.endTime}`
        });
      }
    }
    
    // Convert time strings to numbers for proper comparison while preserving sessionId and endTime
    const convertSessions = sessions.map(s => {
      const startNum = timeToNumber(s.startTime);
      const endNum = timeToNumber(s.endTime);

      if (endNum <= startNum) {
        throw new Error(`Invalid time range on ${s.day}: ${s.startTime} must be before ${s.endTime}`);
      }

      return {
        sessionId: s.sessionId || require('uuid').v4(), // PRESERVE OR CREATE
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime,
        startNum,
        endNum,
        type: s.type,
        subject: s.subject,
        lecturer: s.lecturer,
        location: s.location
      };
    });
    
    // Atomic upsert - handles both create and update without duplicate key errors
    const data = await StudentTimeTable.findOneAndUpdate(
      { year, semester, batch, specialization, group },
      {
        year, semester, batch, specialization, group,
        sessions: convertSessions
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    res.json(data);
  } catch (error) {
    console.error('MongoDB Error:', error); // ADD THIS - Shows real error
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const data = await StudentTimeTable.find()
      .populate('sessions.lecturer', 'name');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timetables', error: error.message });
  }
});

router.get('/filter', async (req, res) => {
  try {
    const { year, semester, batch, specialization, group } = req.query;
    
    const data = await StudentTimeTable.findOne({
      year, semester, batch, specialization, group
    })
    .populate('sessions.lecturer', 'name');
    
    res.json(data || { sessions: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timetable', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { sessions } = req.body;

    // Validate all sessions before processing
    for (const s of sessions) {
      const startNum = timeToNumber(s.startTime);
      const endNum = timeToNumber(s.endTime);
      
      if (endNum <= startNum) {
        return res.status(400).json({
          message: `Invalid time range on ${s.day}: ${s.startTime} must be before ${s.endTime}`
        });
      }
    }

    // Convert time strings to numbers for proper comparison
    const convertSessions = sessions.map(s => ({
      ...s,
      startNum: timeToNumber(s.startTime),
      endNum: timeToNumber(s.endTime)
    }));

    const data = await StudentTimeTable.findByIdAndUpdate(
      req.params.id,
      { ...req.body, sessions: convertSessions },
      { new: true }
    )
    .populate('sessions.lecturer', 'name');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error updating timetable', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await StudentTimeTable.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting timetable', error: error.message });
  }
});

// Get timetables by lecturer ID
router.get('/lecturer/:id', async (req, res) => {
  try {
    const data = await StudentTimeTable.find({
      "sessions.lecturer": req.params.id
    })
    .populate('sessions.lecturer', 'name');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lecturer timetables', error: error.message });
  }
});

// Enterprise-grade clash detection API (single query, secure, validated)
router.post('/check-clash', async (req, res) => {
  try {
    const { sessions, currentTimetableId } = req.body;

    for (const newS of sessions) {

      // SECURITY: Never trust frontend data - recompute times in backend
      const startNum = timeToNumber(newS.startTime);
      const endNum = timeToNumber(newS.endTime);

      // VALIDATION: Ensure endTime > startTime
      if (endNum <= startNum) {
        return res.status(400).json({
          clash: true,
          type: 'INVALID_TIME',
          message: `Invalid time range on ${newS.day}: ${newS.startTime} must be before ${newS.endTime}`
        });
      }

      // Lunch break protection (12:00 - 13:00)
      if (startNum < 13 && endNum > 12) {
        return res.json({
          clash: true,
          type: 'LUNCH_BREAK',
          message: `Session conflicts with lunch break (12:00 - 13:00) on ${newS.day}`
        });
      }

      // PERFORMANCE: Single query with $or for both lecturer and location clashes
      const clash = await StudentTimeTable.findOne({
        _id: { $ne: currentTimetableId },
        sessions: {
          $elemMatch: {
            day: newS.day,
            startNum: { $lt: endNum },
            endNum: { $gt: startNum },
            $or: [
              { lecturer: newS.lecturer },
              { location: newS.location }
            ]
          }
        }
      })
      .populate('sessions.lecturer', 'name');

      if (clash) {
        // Find the specific conflicting session
        const conflictingSession = clash.sessions.find(session => 
          session.day === newS.day &&
          ((session.startNum < endNum && session.endNum > startNum))
        );

        if (conflictingSession) {
          let clashType, message, name;

          // Determine clash type and get proper name
          if (conflictingSession.lecturer._id.toString() === newS.lecturer) {
            clashType = 'LECTURER';
            name = conflictingSession.lecturer.name;
            message = `Lecturer ${name} is already scheduled at ${newS.day} ${newS.startTime}-${newS.endTime}`;
          } else {
            clashType = 'LOCATION';
            name = conflictingSession.location; // Location is now a string
            message = `Location ${name} is already occupied at ${newS.day} ${newS.startTime}-${newS.endTime}`;
          }

          return res.json({
            clash: true,
            type: clashType,
            message,
            timetableInfo: {
              year: clash.year,
              semester: clash.semester,
              batch: clash.batch,
              specialization: clash.specialization,
              group: clash.group
            }
          });
        }
      }

    }

    res.json({ clash: false });

  } catch (error) {
    res.status(500).json({ message: 'Error checking clashes', error: error.message });
  }
});


// Lab busy sessions hook (for future LabFreeTime generation) - Optimized
router.get('/lab-sessions', async (req, res) => {
  try {
    const data = await StudentTimeTable.find(
      { "sessions.type": "LAB" },
      { sessions: 1, year: 1, semester: 1, batch: 1, specialization: 1, group: 1 }
    );
    
    const labSessions = [];
    
    data.forEach(timetable => {
      timetable.sessions.forEach(session => {
        if (session.type === 'LAB') {
          labSessions.push({
            ...JSON.parse(JSON.stringify(session)),
            timetableInfo: {
              year: timetable.year,
              semester: timetable.semester,
              batch: timetable.batch,
              specialization: timetable.specialization,
              group: timetable.group
            }
          });
        }
      });
    });
    
    res.json(labSessions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lab sessions', error: error.message });
  }
});

module.exports = router;
