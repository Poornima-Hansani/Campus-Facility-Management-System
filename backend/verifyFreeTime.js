const mongoose = require('mongoose');
const LabFreeTime = require('./models/LabFreeTime');
const { connectDB } = require('./config/database');

// Verify LabFreeTime data
const verifyLabFreeTimeData = async () => {
  try {
    await connectDB();
    console.log('🔍 Verifying LabFreeTime database table...');

    const freeTimeData = await LabFreeTime.find({});
    console.log(`📊 Found ${freeTimeData.length} labs in LabFreeTime table`);

    freeTimeData.forEach(lab => {
      console.log(`\n🏢 Lab: ${lab.labNumber}`);
      console.log(`📅 Total free slots: ${lab.freeTimeSlots.length}`);
      console.log(`⏰ Operating hours: ${JSON.stringify(lab.operatingHours)}`);
      
      // Group slots by day
      const slotsByDay = {};
      lab.freeTimeSlots.forEach(slot => {
        if (!slotsByDay[slot.day]) {
          slotsByDay[slot.day] = [];
        }
        slotsByDay[slot.day].push(slot);
      });

      Object.entries(slotsByDay).forEach(([day, slots]) => {
        console.log(`  ${day}:`);
        slots.forEach(slot => {
          console.log(`    ${slot.startTime} - ${slot.endTime} (${slot.status})`);
        });
      });
    });

    console.log('\n✅ LabFreeTime database table verification completed!');
    
  } catch (error) {
    console.error('❌ Error verifying LabFreeTime data:', error);
  } finally {
    mongoose.connection.close();
  }
};

verifyLabFreeTimeData();
