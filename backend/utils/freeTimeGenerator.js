const LabTimetable = require('../models/LabTimetable');
const LabFreeTime = require('../models/LabFreeTime');

/**
 * Generate free time slots for all labs based on their occupied timetables
 */
const generateFreeTimeForAllLabs = async () => {
  try {
    console.log('🔄 Starting free time generation for all labs...');
    
    // Get all lab timetables
    const labTimetables = await LabTimetable.find({})
      .populate('slots.lecturer', 'name email');
    
    console.log(`📊 Found ${labTimetables.length} lab timetables`);
    
    const results = [];
    
    for (const labTimetable of labTimetables) {
      try {
        console.log(`🔧 Processing ${labTimetable.labNumber}...`);
        
        // Get or create free time schedule
        let freeTimeSchedule = await LabFreeTime.findOne({
          labNumber: labTimetable.labNumber
        });

        if (!freeTimeSchedule) {
          freeTimeSchedule = new LabFreeTime({
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
            breakTimes: [
              { day: 'Monday', startTime: '12:00', endTime: '13:00', reason: 'Lunch break' },
              { day: 'Tuesday', startTime: '12:00', endTime: '13:00', reason: 'Lunch break' },
              { day: 'Wednesday', startTime: '12:00', endTime: '13:00', reason: 'Lunch break' },
              { day: 'Thursday', startTime: '12:00', endTime: '13:00', reason: 'Lunch break' },
              { day: 'Friday', startTime: '12:00', endTime: '13:00', reason: 'Lunch break' },
            ]
          });
        }

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
    return results;
    
  } catch (error) {
    console.error('❌ Error in generateFreeTimeForAllLabs:', error);
    throw error;
  }
};

/**
 * Generate free time slots for a specific lab
 */
const generateFreeTimeForLab = async (labNumber) => {
  try {
    console.log(`🔄 Generating free time for ${labNumber}...`);
    
    // Get lab timetable
    const labTimetable = await LabTimetable.findOne({
      labNumber: { $in: [labNumber, `Lab${labNumber}`] }
    }).populate('slots.lecturer', 'name email');

    if (!labTimetable) {
      throw new Error(`Lab timetable not found for ${labNumber}`);
    }

    // Get or create free time schedule
    let freeTimeSchedule = await LabFreeTime.findOne({
      labNumber: { $in: [labNumber, `Lab${labNumber}`] }
    });

    if (!freeTimeSchedule) {
      freeTimeSchedule = new LabFreeTime({
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
        breakTimes: [
          { day: 'Monday', startTime: '12:00', endTime: '13:00', reason: 'Lunch break' },
          { day: 'Tuesday', startTime: '12:00', endTime: '13:00', reason: 'Lunch break' },
          { day: 'Wednesday', startTime: '12:00', endTime: '13:00', reason: 'Lunch break' },
          { day: 'Thursday', startTime: '12:00', endTime: '13:00', reason: 'Lunch break' },
          { day: 'Friday', startTime: '12:00', endTime: '13:00', reason: 'Lunch break' },
        ]
      });
    }

    // Generate free slots based on occupied slots
    await freeTimeSchedule.generateFreeSlots(labTimetable.slots);
    
    console.log(`✅ ${labTimetable.labNumber}: ${freeTimeSchedule.freeTimeSlots.length} free slots generated`);
    
    return freeTimeSchedule;
    
  } catch (error) {
    console.error(`❌ Error generating free time for ${labNumber}:`, error);
    throw error;
  }
};

/**
 * Update free time slots when lab timetable changes
 */
const updateFreeTimeOnTimetableChange = async (labNumber) => {
  try {
    console.log(`🔄 Updating free time for ${labNumber} after timetable change...`);
    
    // Regenerate free time for the specific lab
    const freeTimeSchedule = await generateFreeTimeForLab(labNumber);
    
    console.log(`✅ Free time updated for ${labNumber}`);
    return freeTimeSchedule;
    
  } catch (error) {
    console.error(`❌ Error updating free time for ${labNumber}:`, error);
    throw error;
  }
};

/**
 * Get free time statistics for all labs
 */
const getFreeTimeStatistics = async () => {
  try {
    const freeTimeSchedules = await LabFreeTime.find({ isActive: true });
    
    const stats = {
      totalLabs: freeTimeSchedules.length,
      totalFreeSlots: 0,
      averageFreeSlotsPerLab: 0,
      labDetails: []
    };
    
    freeTimeSchedules.forEach(schedule => {
      const freeSlotsCount = schedule.freeTimeSlots.length;
      stats.totalFreeSlots += freeSlotsCount;
      
      // Calculate free slots by day
      const freeSlotsByDay = {};
      schedule.freeTimeSlots.forEach(slot => {
        freeSlotsByDay[slot.day] = (freeSlotsByDay[slot.day] || 0) + 1;
      });
      
      stats.labDetails.push({
        labNumber: schedule.labNumber,
        freeSlotsCount,
        freeSlotsByDay,
        lastUpdated: schedule.lastUpdated
      });
    });
    
    stats.averageFreeSlotsPerLab = stats.totalLabs > 0 ? stats.totalFreeSlots / stats.totalLabs : 0;
    
    return stats;
    
  } catch (error) {
    console.error('❌ Error getting free time statistics:', error);
    throw error;
  }
};

module.exports = {
  generateFreeTimeForAllLabs,
  generateFreeTimeForLab,
  updateFreeTimeOnTimetableChange,
  getFreeTimeStatistics
};
