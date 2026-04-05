const mongoose = require('mongoose');
const StudentFreeTime = require('./models/StudentFreeTime');
const { connectDB } = require('./config/database');

// Verify student free time data
const verifyStudentFreeTimeData = async () => {
  try {
    await connectDB();
    console.log('🔍 Verifying StudentFreeTime database table...');

    const studentFreeTimeData = await StudentFreeTime.find({});
    console.log(`📊 Found ${studentFreeTimeData.length} students in StudentFreeTime table`);

    studentFreeTimeData.forEach(student => {
      console.log(`\n👤 Student: ${student.studentIdentifier}`);
      console.log(`📅 Total free slots: ${student.freeTimeSlots.length}`);
      
      // Group slots by day
      const slotsByDay = {};
      student.freeTimeSlots.forEach(slot => {
        if (!slotsByDay[slot.day]) {
          slotsByDay[slot.day] = [];
        }
        slotsByDay[slot.day].push(slot);
      });

      Object.entries(slotsByDay).forEach(([day, slots]) => {
        console.log(`  ${day}:`);
        slots.forEach(slot => {
          console.log(`    ${slot.startTime} - ${slot.endTime} (${slot.reason})`);
        });
      });
    });

    console.log('\n✅ StudentFreeTime database table verification completed!');
    
  } catch (error) {
    console.error('❌ Error verifying StudentFreeTime data:', error);
  } finally {
    mongoose.connection.close();
  }
};

verifyStudentFreeTimeData();
