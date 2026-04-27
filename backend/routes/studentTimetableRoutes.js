const express = require('express');

const router = express.Router();

const StudentTimeTable = require('../models/StudentTimeTable');

const labTimetableRoutes = require('./labTimetableRoutes');

const { rebuildLabTimetables } = labTimetableRoutes;

const { rebuildForOneGroup } = require('../services/labStudentCommonFreeService');

// Calculate free time from sessions based on batch type

const calculateFreeTime = (sessions, batch) => {

  const result = {};

  

  // Define days based on batch type

  const weekdayDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const weekendDays = ['Saturday', 'Sunday'];

  

  // Process relevant days based on batch

  const daysToProcess = batch === 'WD' ? weekdayDays : weekendDays;

  

  daysToProcess.forEach(day => {

    // Filter sessions for this day

    const daySessions = sessions.filter(s => s.day === day);

    

    // Define working hours based on day type

    const workingHours = (day === 'Saturday' || day === 'Sunday') 

      ? { start: 8.0, end: 20.0 }  // Weekend: 8:00 - 20:00

      : { start: 8.0, end: 17.5 }; // Weekday: 8:00 - 17:30

    

    // Sort sessions by start time

    daySessions.sort((a, b) => a.startNum - b.startNum);

    

    // Extract busy slots

    const busy = daySessions.map(s => ({

      start: s.startNum,

      end: s.endNum

    }));

    

    // Calculate free slots

    const free = [];

    let currentTime = workingHours.start;

    

    for (const session of daySessions) {

      // Add free time before this session

      if (currentTime < session.startNum) {

        free.push({

          start: currentTime,

          end: session.startNum

        });

      }

      // Update current time to end of this session

      currentTime = Math.max(currentTime, session.endNum);

    }

    

    // Add free time after last session

    if (currentTime < workingHours.end) {

      free.push({

        start: currentTime,

        end: workingHours.end

      });

    }

    

    // If no sessions, entire working day is free

    if (daySessions.length === 0) {

      free.push({

        start: workingHours.start,

        end: workingHours.end

      });

    }

    

    result[day] = { busy, free };

  });

  

  return result;

};



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

    

    // Calculate free time from converted sessions based on batch type

    const freeTime = calculateFreeTime(convertSessions, batch);

    

    // Atomic upsert - handles both create and update without duplicate key errors

    const data = await StudentTimeTable.findOneAndUpdate(

      { year, semester, batch, specialization, group },

      {

        year, semester, batch, specialization, group,

        sessions: convertSessions,

        freeTime: freeTime

      },

      { upsert: true, new: true, setDefaultsOnInsert: true }

    );

    

    // Rebuild LabTimetable after StudentTimeTable changes

    try {

      await rebuildLabTimetables();

    } catch (rebuildError) {

      console.error('LabTimetable rebuild error:', rebuildError);

      // Don't fail the main operation if rebuild fails

    }

    // Rebuild LabStudentCommonFree table after StudentTimeTable changes
    try {
      await rebuildForOneGroup(data);
    } catch (rebuildError) {
      console.error('LabStudentCommonFree rebuild error:', rebuildError);
      // Don't fail the main operation if rebuild fails
    }

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



    // Get existing timetable to determine batch type

    const existingTimetable = await StudentTimeTable.findById(req.params.id);

    

    // Calculate free time from converted sessions based on batch type

    const freeTime = calculateFreeTime(convertSessions, existingTimetable.batch);



    const data = await StudentTimeTable.findByIdAndUpdate(

      req.params.id,

      { ...req.body, sessions: convertSessions, freeTime: freeTime },

      { new: true }

    )

    .populate('sessions.lecturer', 'name');

    

    // Rebuild LabTimetable after StudentTimeTable changes

    try {

      await rebuildLabTimetables();

    } catch (rebuildError) {

      console.error('LabTimetable rebuild error:', rebuildError);

      // Don't fail the main operation if rebuild fails

    }

    // Rebuild LabStudentCommonFree table after StudentTimeTable changes
    try {
      await rebuildForOneGroup(data);
    } catch (rebuildError) {
      console.error('LabStudentCommonFree rebuild error:', rebuildError);
      // Don't fail the main operation if rebuild fails
    }

    res.json(data);

  } catch (error) {

    res.status(500).json({ message: 'Error updating timetable', error: error.message });

  }

});



router.delete('/:id', async (req, res) => {

  try {

    // Get existing data before deletion
    const existing = await StudentTimeTable.findById(req.params.id);
    
    await StudentTimeTable.findByIdAndDelete(req.params.id);

    

    // Rebuild LabTimetable after StudentTimeTable changes

    try {

      await rebuildLabTimetables();

    } catch (rebuildError) {

      console.error('LabTimetable rebuild error:', rebuildError);

      // Don't fail main operation if rebuild fails

    }

    // Rebuild using existing data before deletion
    if (existing) {
      try {
        await rebuildForOneGroup(existing);
      } catch (rebuildError) {
        console.error('LabStudentCommonFree rebuild error:', rebuildError);
        // Don't fail main operation if rebuild fails
      }
    }

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



// Get user's free time slots for study area booking
router.get('/free-slots/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    
    // Get user information - find by MongoDB _id
    const User = require('../models/User');
    let user = await User.findById(userId);
    
    // If not found by _id, try by userId field
    if (!user) {
      user = await User.findOne({ userId: userId });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Convert user fields to timetable format
    const timetableQuery = {
      year: `Y${user.year}`,
      semester: `S${user.semester}`,
      batch: user.scheduleType === 'Weekend' ? 'WE' : 'WD',
      specialization: user.specialization,
      group: user.group
    };
    
    // Get student's timetable
    const timetable = await StudentTimeTable.findOne(timetableQuery);
    
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found for this student'
      });
    }
    
    // If specific date is provided, get free slots for that day
    if (date) {
      const targetDate = new Date(date);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[targetDate.getDay()];
      
      const freeSlots = timetable.freeTime[dayName] || { free: [] };
      
      // Convert numeric times to readable format
      const timeToString = (num) => {
        const hours = Math.floor(num);
        const minutes = (num % 1) * 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      };
      
      const formattedSlots = freeSlots.free.map(slot => ({
        day: dayName,
        startTime: timeToString(slot.start),
        endTime: timeToString(slot.end),
        startNum: slot.start,
        endNum: slot.end,
        duration: slot.end - slot.start
      }));
      
      return res.json({
        success: true,
        data: {
          date: date,
          day: dayName,
          freeSlots: formattedSlots
        }
      });
    }
    
    // If no specific date, return all free slots for the week
    const timeToString = (num) => {
      const hours = Math.floor(num);
      const minutes = (num % 1) * 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };
    
    const allFreeSlots = {};
    Object.keys(timetable.freeTime).forEach(day => {
      const dayData = timetable.freeTime[day];
      if (dayData && dayData.free) {
        allFreeSlots[day] = dayData.free.map(slot => ({
          startTime: timeToString(slot.start),
          endTime: timeToString(slot.end),
          startNum: slot.start,
          endNum: slot.end,
          duration: slot.end - slot.start
        }));
      }
    });
    
    res.json({
      success: true,
      data: {
        userInfo: {
          year: user.year,
          semester: user.semester,
          batch: user.scheduleType,
          specialization: user.specialization,
          group: user.group
        },
        freeSlots: allFreeSlots
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching free time slots',
      error: error.message
    });
  }
});

// Get student free time by day - STEP 1 Foundation
router.get('/free-time/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { day } = req.query;
    
    // 1. Find the user by userId from Users collection
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // 2. Convert user fields to timetable format
    const timetableQuery = {
      year: `Y${user.year}`,
      semester: `S${user.semester}`,
      batch: user.scheduleType === 'Weekend' ? 'WE' : 'WD',
      specialization: user.specialization,
      group: user.group
    };
    
    // 3. Find StudentTimeTable using converted fields
    const timetable = await StudentTimeTable.findOne(timetableQuery);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found for this student' });
    }
    
    // 4. Validate day parameter
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!day || !validDays.includes(day)) {
      return res.status(400).json({ message: 'Valid day parameter is required' });
    }
    
    // 5. Get free slots for the specific day
    const dayFreeTime = timetable.freeTime[day];
    if (!dayFreeTime || !dayFreeTime.free) {
      return res.json({ day, freeSlots: [] });
    }
    
    // 6. Convert numeric time to string format (8→08:00, 8.5→08:30)
    const numericToTimeString = (num) => {
      const hours = Math.floor(num);
      const minutes = (num % 1) * 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };
    
    // 7. Format free slots
    const freeSlots = dayFreeTime.free.map(slot => ({
      startTime: numericToTimeString(slot.start),
      endTime: numericToTimeString(slot.end),
      duration: slot.end - slot.start
    }));
    
    res.json({
      day,
      freeSlots
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching free time', error: error.message });
  }
});

module.exports = router;