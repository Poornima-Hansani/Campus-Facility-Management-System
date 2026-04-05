const express = require('express');
const router = express.Router();
const LabFreeTime = require('../models/LabFreeTime');
const LabTimetable = require('../models/LabTimetable');
const { 
  generateFreeTimeForAllLabs, 
  generateFreeTimeForLab, 
  getFreeTimeStatistics 
} = require('../utils/freeTimeGenerator');

// GET all lab free time schedules
router.get('/', async (req, res) => {
  try {
    const freeTimeSchedules = await LabFreeTime.find({ isActive: true })
      .sort({ labNumber: 1 });
    res.json(freeTimeSchedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET free time schedule for a specific lab
router.get('/:labNumber', async (req, res) => {
  try {
    const { labNumber } = req.params;
    const raw = labNumber;
    const normalized = raw.replace('Lab', '');

    const freeTimeSchedule = await LabFreeTime.findOne({
      labNumber: { $in: [raw, normalized] },
      isActive: true
    });

    if (!freeTimeSchedule) {
      return res.status(404).json({ message: 'No free time schedule found for this lab' });
    }

    res.json(freeTimeSchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET free time slots grouped by day for a specific lab
router.get('/:labNumber/grouped', async (req, res) => {
  try {
    const { labNumber } = req.params;
    const raw = labNumber;
    const normalized = raw.replace('Lab', '');

    const freeTimeSchedule = await LabFreeTime.findOne({
      labNumber: { $in: [raw, normalized] },
      isActive: true
    });

    if (!freeTimeSchedule) {
      return res.status(404).json({ message: 'No free time schedule found for this lab' });
    }

    const groupedSlots = freeTimeSchedule.getAllFreeSlotsGrouped();
    res.json(groupedSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE free time schedule for a lab
router.post('/', async (req, res) => {
  try {
    const freeTimeSchedule = new LabFreeTime(req.body);
    await freeTimeSchedule.save();
    res.status(201).json(freeTimeSchedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE free time schedule for a lab
router.put('/:labNumber', async (req, res) => {
  try {
    const { labNumber } = req.params;
    const raw = labNumber;
    const normalized = raw.replace('Lab', '');

    const freeTimeSchedule = await LabFreeTime.findOneAndUpdate(
      { labNumber: { $in: [raw, normalized] } },
      req.body,
      { new: true, runValidators: true }
    );

    if (!freeTimeSchedule) {
      return res.status(404).json({ message: 'Free time schedule not found' });
    }

    res.json(freeTimeSchedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ADD free time slot to a lab schedule
router.post('/:labNumber/slots', async (req, res) => {
  try {
    const { labNumber } = req.params;
    const raw = labNumber;
    const normalized = raw.replace('Lab', '');

    const freeTimeSchedule = await LabFreeTime.findOne({
      labNumber: { $in: [raw, normalized] }
    });

    if (!freeTimeSchedule) {
      // Create new schedule if it doesn't exist
      const newSchedule = new LabFreeTime({
        labNumber: normalized,
        freeTimeSlots: [req.body]
      });
      await newSchedule.save();
      res.status(201).json(newSchedule);
    } else {
      freeTimeSchedule.freeTimeSlots.push(req.body);
      await freeTimeSchedule.save();
      res.json(freeTimeSchedule);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE free time slot from a lab schedule
router.delete('/:labNumber/slots/:slotIndex', async (req, res) => {
  try {
    const { labNumber, slotIndex } = req.params;
    const raw = labNumber;
    const normalized = raw.replace('Lab', '');

    const freeTimeSchedule = await LabFreeTime.findOne({
      labNumber: { $in: [raw, normalized] }
    });

    if (!freeTimeSchedule) {
      return res.status(404).json({ message: 'Free time schedule not found' });
    }

    freeTimeSchedule.freeTimeSlots.splice(parseInt(slotIndex), 1);
    await freeTimeSchedule.save();
    res.json(freeTimeSchedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GENERATE free time slots automatically based on LabTimetable
router.post('/:labNumber/generate', async (req, res) => {
  try {
    const { labNumber } = req.params;
    const freeTimeSchedule = await generateFreeTimeForLab(labNumber);
    res.json(freeTimeSchedule);
  } catch (error) {
    console.error('Error generating free time slots:', error);
    res.status(500).json({ message: error.message });
  }
});

// GENERATE free time slots for ALL labs
router.post('/generate-all', async (req, res) => {
  try {
    const results = await generateFreeTimeForAllLabs();
    res.json({
      message: 'Free time slots generation completed',
      results: results
    });
  } catch (error) {
    console.error('Error generating free time slots for all labs:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET free time statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await getFreeTimeStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SIMPLE GENERATE free time for all labs (without external utils)
router.post('/simple-generate', async (req, res) => {
  try {
    console.log('🔄 Starting simple free time generation...');
    
    // Get all lab timetables
    const labTimetables = await LabTimetable.find({});
    console.log(`📊 Found ${labTimetables.length} lab timetables`);

    if (labTimetables.length === 0) {
      return res.status(404).json({ message: 'No lab timetables found' });
    }

    // Clear existing free time data
    await LabFreeTime.deleteMany({});
    console.log('🗑️ Cleared existing free time data');

    const results = [];

    for (const labTimetable of labTimetables) {
      try {
        console.log(`🔧 Processing ${labTimetable.labNumber}...`);
        
        // Create free time schedule
        const freeTimeSchedule = new LabFreeTime({
          labNumber: labTimetable.labNumber,
          operatingHours: {
            Monday: { open: '08:00', close: '22:00' },
            Tuesday: { open: '08:00', close: '22:00' },
            Wednesday: { open: '08:00', close: '22:00' },
            Thursday: { open: '08:00', close: '22:00' },
            Friday: { open: '08:00', close: '22:00' },
            Saturday: { open: '08:00', close: '20:00' },
            Sunday: { open: '08:00', close: '20:00' },
          },
          defaultOperatingHours: {
            weekdays: { open: '08:00', close: '22:00' },
            weekends: { open: '08:00', close: '20:00' },
          },
          breakTimes: [
            { day: 'Monday', startTime: '12:00', endTime: '13:00', reason: 'Lunch break' },
            { day: 'Tuesday', startTime: '12:00', endTime: '13:00', reason: 'Lunch break' },
            { day: 'Wednesday', startTime: '12:00', endTime: '13:00', reason: 'Lunch break' },
            { day: 'Thursday', startTime: '12:00', endTime: '13:00', reason: 'Lunch break' },
            { day: 'Friday', startTime: '12:00', endTime: '13:00', reason: 'Lunch break' },
          ],
          isActive: true
        });

        // Generate free slots based on occupied slots
        await freeTimeSchedule.generateFreeSlots(labTimetable.slots);
        
        results.push({
          labNumber: labTimetable.labNumber,
          success: true,
          occupiedSlots: labTimetable.slots.length,
          freeSlots: freeTimeSchedule.freeTimeSlots.length
        });
        
        console.log(`✅ ${labTimetable.labNumber}: ${freeTimeSchedule.freeTimeSlots.length} free slots generated`);

      } catch (error) {
        console.error(`❌ Error processing ${labTimetable.labNumber}:`, error.message);
        results.push({
          labNumber: labTimetable.labNumber,
          success: false,
          error: error.message
        });
      }
    }
    
    console.log('🎯 Free time generation completed');
    res.json({
      message: 'Free time slots generation completed',
      results: results
    });
    
  } catch (error) {
    console.error('❌ Error generating free time slots:', error);
    res.status(500).json({ message: error.message });
  }
});

// CHECK if a specific time slot is available
router.get('/:labNumber/check', async (req, res) => {
  try {
    const { labNumber } = req.params;
    const { day, startTime, endTime } = req.query;

    if (!day || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Missing required parameters: day, startTime, endTime' 
      });
    }

    const raw = labNumber;
    const normalized = raw.replace('Lab', '');

    const freeTimeSchedule = await LabFreeTime.findOne({
      labNumber: { $in: [raw, normalized] },
      isActive: true
    });

    if (!freeTimeSchedule) {
      return res.status(404).json({ message: 'Free time schedule not found for this lab' });
    }

    const isAvailable = freeTimeSchedule.isTimeSlotAvailable(day, startTime, endTime);
    
    res.json({
      labNumber: freeTimeSchedule.labNumber,
      day,
      startTime,
      endTime,
      isAvailable
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE free time schedule for a lab
router.delete('/:labNumber', async (req, res) => {
  try {
    const { labNumber } = req.params;
    const raw = labNumber;
    const normalized = raw.replace('Lab', '');

    const result = await LabFreeTime.deleteMany({ 
      labNumber: { $in: [raw, normalized] } 
    });

    res.json({ message: 'Free time schedule deleted', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
