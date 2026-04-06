const mongoose = require('mongoose');
const LabTimetable = require('./models/LabTimetable');
const { connectDB } = require('./config/database');

// Check current LabTimetable data
const checkLabTimetableData = async () => {
  try {
    await connectDB();
    console.log('🔍 Checking LabTimetable data...');

    const labTimetables = await LabTimetable.find({});
    console.log(`📊 Found ${labTimetables.length} lab timetables`);

    labTimetables.forEach(lab => {
      console.log(`\n🏢 Lab: ${lab.labNumber}`);
      console.log(`📅 Total occupied slots: ${lab.slots.length}`);
      
      // Group slots by day
      const slotsByDay = {};
      lab.slots.forEach(slot => {
        if (!slotsByDay[slot.day]) {
          slotsByDay[slot.day] = [];
        }
        slotsByDay[slot.day].push(slot);
      });

      Object.entries(slotsByDay).forEach(([day, slots]) => {
        console.log(`  ${day}:`);
        slots.forEach(slot => {
          console.log(`    ${slot.startTime} - ${slot.endTime} (${slot.title || 'No title'})`);
        });
      });
    });

    console.log('\n✅ LabTimetable data check completed!');
    
  } catch (error) {
    console.error('❌ Error checking LabTimetable data:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkLabTimetableData();
