const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const LabTimetable = require('../models/LabTimetable');

// ✅ Get all labs
router.get('/', async (req, res) => {
  try {
    const labs = await LabTimetable.find({});
    res.json(labs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Create lab timetable
router.post('/', async (req, res) => {
  try {
    const labTimetable = new LabTimetable(req.body);
    await labTimetable.save();
    res.status(201).json(labTimetable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ DELETE lab timetable
router.delete('/:labNumber', async (req, res) => {
  try {
    await LabTimetable.deleteMany({ labNumber: req.params.labNumber });
    res.json({ message: 'Lab timetable deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ GET FREE TIME FOR A LAB (MAIN LOGIC)
router.get('/free/:labNumber', async (req, res) => {
  const { labNumber } = req.params;

  const timetables = await Timetable.find({
    'days.slots.labNumber': labNumber,
  });

  let occupied = [];

  timetables.forEach((tt) => {
    tt.days.forEach((day) => {
      day.slots.forEach((slot) => {
        if (slot.labNumber === labNumber) {
          occupied.push({
            day: day.day,
            start: slot.startTime,
            end: slot.endTime,
          });
        }
      });
    });
  });

  res.json(occupied);
});

// GET LAB TIMETABLE FROM DB (NOT CALCULATED)
router.get('/timetable/:labNumber', async (req, res) => {
  console.log(` Lab timetable requested for: ${req.params.labNumber}`);
  try {
    const raw = req.params.labNumber;          // "Lab101" or "101"
    const normalized = raw.replace('Lab', ''); // "101" from "Lab101"

    const data = await LabTimetable.findOne({
      labNumber: { $in: [raw, normalized] },
    }).populate('slots.lecturer', 'name email');

    console.log(` Found data:`, data ? 'YES' : 'NO');
    if (data) {
      console.log(` Lab ${req.params.labNumber} has ${data.slots.length} slots`);
    }

    if (!data) {
      return res.status(404).json({ message: 'No timetable found' });
    }

    res.json(data);
  } catch (error) {
    console.error(' Error in lab timetable route:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET ALL LAB TIMETABLES (only labs that have sessions)
router.get('/timetable', async (req, res) => {
  try {
    const data = await LabTimetable.find({})
      .populate('slots.lecturer', 'name email');

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE LAB TIMETABLE RECORD
router.post('/timetable', async (req, res) => {
  try {
    const labTimetable = new LabTimetable(req.body);
    await labTimetable.save();
    res.status(201).json(labTimetable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE LAB TIMETABLE RECORD
router.delete('/timetable/:labNumber', async (req, res) => {
  try {
    await LabTimetable.deleteMany({ labNumber: req.params.labNumber });
    res.json({ message: 'Lab timetable deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ALL STUDENT BATCHES FOR ALL LABS
router.get('/student-batches', async (req, res) => {
  try {
    const labTimetables = await LabTimetable.find({ isActive: true })
      .populate('slots.lecturer', 'name email')
      .populate('allStudentBatches.lecturer', 'name email');
    
    const allBatches = new Map();
    
    labTimetables.forEach(lab => {
      const batches = lab.getAllStudentBatches();
      batches.forEach(batch => {
        const key = batch.key;
        if (!allBatches.has(key)) {
          allBatches.set(key, {
            ...batch,
            labs: [],
            totalWeeklyHours: 0
          });
        }
        allBatches.get(key).labs.push(lab.labNumber);
        
        // Calculate weekly hours for this batch in this lab
        const labSlots = lab.slots.filter(slot => 
          slot.studentBatches.some(sb => 
            sb.faculty === batch.faculty && 
            sb.year === batch.year && 
            sb.semester === batch.semester &&
            sb.batchType === batch.batchType &&
            sb.group === batch.group
          )
        );
        
        labSlots.forEach(slot => {
          const start = new Date(`2000-01-01 ${slot.startTime}`);
          const end = new Date(`2000-01-01 ${slot.endTime}`);
          const hours = (end - start) / (1000 * 60 * 60);
          allBatches.get(key).totalWeeklyHours += hours;
        });
      });
    });
    
    res.json(Array.from(allBatches.values()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET TIMETABLE BY FACULTY
router.get('/faculty/:faculty', async (req, res) => {
  try {
    const { faculty } = req.params;
    const labTimetables = await LabTimetable.find({ isActive: true })
      .populate('slots.lecturer', 'name email');
    
    const facultyTimetables = {};
    
    labTimetables.forEach(lab => {
      const facultySlots = lab.getTimetableByFaculty(faculty);
      if (facultySlots.length > 0) {
        facultyTimetables[lab.labNumber] = facultySlots;
      }
    });
    
    res.json(facultyTimetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET TIMETABLE BY YEAR AND SEMESTER
router.get('/year/:year/semester/:semester', async (req, res) => {
  try {
    const { year, semester } = req.params;
    const labTimetables = await LabTimetable.find({ isActive: true })
      .populate('slots.lecturer', 'name email');
    
    const yearSemesterTimetables = {};
    
    labTimetables.forEach(lab => {
      const yearSemesterSlots = lab.getTimetableByYearSemester(
        parseInt(year), 
        parseInt(semester)
      );
      if (yearSemesterSlots.length > 0) {
        yearSemesterTimetables[lab.labNumber] = yearSemesterSlots;
      }
    });
    
    res.json(yearSemesterTimetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET LAB USAGE STATISTICS
router.get('/stats', async (req, res) => {
  try {
    const labTimetables = await LabTimetable.find({ isActive: true });
    
    const stats = {
      totalLabs: labTimetables.length,
      totalWeeklyHours: 0,
      averageOccupancy: 0,
      labDetails: []
    };
    
    labTimetables.forEach(lab => {
      stats.totalWeeklyHours += lab.usageStats.totalWeeklyHours;
      stats.averageOccupancy += lab.usageStats.averageOccupancy;
      
      stats.labDetails.push({
        labNumber: lab.labNumber,
        capacity: lab.capacity,
        totalWeeklyHours: lab.usageStats.totalWeeklyHours,
        averageOccupancy: lab.usageStats.averageOccupancy,
        peakUsageDay: lab.usageStats.peakUsageDay,
        totalSlots: lab.slots.length,
        occupiedSlots: lab.slots.filter(slot => slot.status === 'occupied').length
      });
    });
    
    stats.averageOccupancy = stats.totalLabs > 0 ? stats.averageOccupancy / stats.totalLabs : 0;
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET COMPREHENSIVE TIMETABLE FOR ALL LABS
router.get('/comprehensive', async (req, res) => {
  try {
    const labTimetables = await LabTimetable.find({ isActive: true })
      .populate('slots.lecturer', 'name email')
      .populate('slots.studentBatches.timetableId')
      .populate('allStudentBatches.lecturer', 'name email');
    
    res.json(labTimetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;