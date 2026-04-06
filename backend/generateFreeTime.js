const mongoose = require('mongoose');
const LabFreeTime = require('./models/LabFreeTime');
const LabTimetable = require('./models/LabTimetable');
const { connectDB } = require('./config/database');

// Calculate and generate free time for all labs
const generateFreeTimeForAllLabs = async () => {
  try {
    await connectDB();
    console.log('🔄 Starting free time calculation for all labs...');

    // Get all lab timetables
    const labTimetables = await LabTimetable.find({});
    
    console.log(`📊 Found ${labTimetables.length} lab timetables`);

    if (labTimetables.length === 0) {
      console.log('⚠️ No lab timetables found in LabTimetable database table.');
      console.log('Please add some lab timetables to the LabTimetable collection first.');
      return;
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
        
        // Save to LabFreeTime database table
        await freeTimeSchedule.save();
        console.log(`💾 Saved free time for ${labTimetable.labNumber} to LabFreeTime table`);
        
        results.push({
          labNumber: labTimetable.labNumber,
          success: true,
          occupiedSlots: labTimetable.slots.length,
          freeSlots: freeTimeSchedule.freeTimeSlots.length
        });
        
        console.log(`✅ ${labTimetable.labNumber}: ${freeTimeSchedule.freeTimeSlots.length} free slots generated and stored`);

        // Display the generated free time schedule
        const groupedSlots = freeTimeSchedule.getAllFreeSlotsGrouped();
        console.log(`📅 ${labTimetable.labNumber} Free Time Schedule:`);
        Object.entries(groupedSlots).forEach(([day, slots]) => {
          console.log(`  ${day}:`);
          slots.forEach(slot => {
            console.log(`    ${slot.startTime} - ${slot.endTime} (${slot.reason})`);
          });
        });

      } catch (error) {
        console.error(`❌ Error processing ${labTimetable.labNumber}:`, error.message);
        results.push({
          labNumber: labTimetable.labNumber,
          success: false,
          error: error.message
        });
      }
    }
    
    console.log('🎯 Free time calculation completed');
    console.log('📊 Summary:');
    results.forEach(result => {
      if (result.success) {
        console.log(`  ✅ ${result.labNumber}: ${result.occupiedSlots} occupied → ${result.freeSlots} free slots`);
      } else {
        console.log(`  ❌ ${result.labNumber}: ${result.error}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error in generateFreeTimeForAllLabs:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
generateFreeTimeForAllLabs();
