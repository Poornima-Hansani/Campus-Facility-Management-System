const express = require('express');
const router = express.Router();
const StudentFreeTime = require('../models/StudentFreeTime');
const Timetable = require('../models/Timetable');
const User = require('../models/User');

// GET all student free time schedules
router.get('/', async (req, res) => {
  try {
    const studentFreeTimeSchedules = await StudentFreeTime.find({})
      .sort({ studentIdentifier: 1 });
    res.json(studentFreeTimeSchedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET free time for specific student
router.get('/:studentIdentifier', async (req, res) => {
  try {
    const { studentIdentifier } = req.params;
    const studentFreeTime = await StudentFreeTime.findOne({ 
      studentIdentifier: studentIdentifier 
    });
    
    if (!studentFreeTime) {
      return res.status(404).json({ message: 'Student free time not found' });
    }
    
    res.json(studentFreeTime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET free time grouped by day for specific student
router.get('/:studentIdentifier/grouped', async (req, res) => {
  try {
    const { studentIdentifier } = req.params;
    const studentFreeTime = await StudentFreeTime.findOne({ 
      studentIdentifier: studentIdentifier 
    });
    
    if (!studentFreeTime) {
      return res.status(404).json({ message: 'Student free time not found' });
    }
    
    // Group slots by day
    const groupedSlots = {};
    studentFreeTime.freeTimeSlots.forEach(slot => {
      if (!groupedSlots[slot.day]) {
        groupedSlots[slot.day] = [];
      }
      groupedSlots[slot.day].push(slot);
    });
    
    res.json({
      studentIdentifier: studentFreeTime.studentIdentifier,
      freeTimeSlots: groupedSlots,
      totalFreeSlots: studentFreeTime.freeTimeSlots.length,
      lastUpdated: studentFreeTime.lastUpdated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CALCULATE free time for all students
router.post('/calculate', async (req, res) => {
  try {
    console.log('🔄 Starting student free time calculation...');
    
    // Get all student timetables
    const studentTimetables = await Timetable.find({});
    console.log(`📊 Found ${studentTimetables.length} student timetables`);

    // Clear existing student free time data
    await StudentFreeTime.deleteMany({});
    console.log('🗑️ Cleared existing student free time data');

    const results = [];

    for (const timetable of studentTimetables) {
      try {
        console.log(`🔧 Processing ${timetable.batchType} ${timetable.faculty} ${timetable.year} ${timetable.semester} ${timetable.group}...`);
        
        // Generate student identifier
        const studentIdentifier = `${timetable.year}S${timetable.semester}_${timetable.batchType}_${timetable.faculty}_${timetable.group}`;
        
        // Create free time schedule for this student
        const studentFreeTime = new StudentFreeTime({
          studentIdentifier: studentIdentifier,
          freeTimeSlots: []
        });

        // Calculate free time for each day
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        days.forEach(day => {
          const dayData = timetable.days.find(d => d.day === day);
          
          if (dayData && dayData.slots.length > 0) {
            // Calculate free time between classes
            const dayStart = new Date(`2000-01-01 08:00`);
            const dayEnd = new Date(`2000-01-01 22:00`);
            
            // Sort slots by start time
            dayData.slots.sort((a, b) => new Date(`2000-01-01 ${a.startTime}`) - new Date(`2000-01-01 ${b.startTime}`));
            
            let currentTime = new Date(dayStart);
            
            dayData.slots.forEach(slot => {
              const slotStart = new Date(`2000-01-01 ${slot.startTime}`);
              const slotEnd = new Date(`2000-01-01 ${slot.endTime}`);
              
              // Add free time before class
              if (currentTime < slotStart) {
                const duration = (slotStart - currentTime) / (1000 * 60 * 60);
                if (duration >= 0.5) { // Minimum 30 minutes
                  studentFreeTime.freeTimeSlots.push({
                    day: day,
                    startTime: currentTime.toTimeString().slice(0, 5),
                    endTime: slotStart.toTimeString().slice(0, 5),
                    reason: 'Before class',
                    priority: 'high',
                    isBookable: true
                  });
                }
              }
              
              // Move current time to end of class
              if (slotEnd > currentTime) {
                currentTime = new Date(slotEnd);
              }
            });
            
            // Add free time after last class
            if (currentTime < dayEnd) {
              const duration = (dayEnd - currentTime) / (1000 * 60 * 60);
              if (duration >= 0.5) {
                studentFreeTime.freeTimeSlots.push({
                  day: day,
                  startTime: currentTime.toTimeString().slice(0, 5),
                  endTime: dayEnd.toTimeString().slice(0, 5),
                  reason: 'After classes',
                  priority: 'medium',
                  isBookable: true
                });
              }
            }
          } else {
            // No classes on this day - full day is free
            studentFreeTime.freeTimeSlots.push({
              day: day,
              startTime: '08:00',
              endTime: '22:00',
              reason: 'No classes',
              priority: 'high',
              isBookable: true
            });
          }
        });

        // Save to database
        await studentFreeTime.save();
        
        results.push({
          studentIdentifier: studentIdentifier,
          success: true,
          freeSlotsCount: studentFreeTime.freeTimeSlots.length,
          timetableInfo: {
            batchType: timetable.batchType,
            faculty: timetable.faculty,
            year: timetable.year,
            semester: timetable.semester,
            group: timetable.group
          }
        });
        
        console.log(`✅ ${studentIdentifier}: ${studentFreeTime.freeTimeSlots.length} free time slots calculated`);

      } catch (error) {
        console.error(`❌ Error processing timetable:`, error.message);
        results.push({
          studentIdentifier: 'Unknown',
          success: false,
          error: error.message
        });
      }
    }
    
    console.log('🎯 Student free time calculation completed');
    
    res.json({
      message: 'Student free time calculation completed',
      results: results
    });
    
  } catch (error) {
    console.error('❌ Error calculating student free time:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET student free time statistics
router.get('/stats', async (req, res) => {
  try {
    const studentFreeTimeSchedules = await StudentFreeTime.find({});
    
    const stats = {
      totalStudents: studentFreeTimeSchedules.length,
      totalFreeSlots: 0,
      averageFreeSlotsPerStudent: 0,
      studentDetails: []
    };
    
    studentFreeTimeSchedules.forEach(schedule => {
      const freeSlotsCount = schedule.freeTimeSlots.length;
      stats.totalFreeSlots += freeSlotsCount;
      
      // Calculate free slots by day
      const freeSlotsByDay = {};
      schedule.freeTimeSlots.forEach(slot => {
        freeSlotsByDay[slot.day] = (freeSlotsByDay[slot.day] || 0) + 1;
      });
      
      stats.studentDetails.push({
        studentIdentifier: schedule.studentIdentifier,
        freeSlotsCount,
        freeSlotsByDay,
        lastUpdated: schedule.lastUpdated
      });
    });
    
    stats.averageFreeSlotsPerStudent = stats.totalStudents > 0 ? stats.totalFreeSlots / stats.totalStudents : 0;
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
