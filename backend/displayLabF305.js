const mongoose = require('mongoose');
const LabFreeTime = require('./models/LabFreeTime');
const { connectDB } = require('./config/database');

// Display LabF305 free time in the requested format
const displayLabF305Format = async () => {
  try {
    await connectDB();
    console.log('📅 LabF305 Free Time Schedule\n');

    const labF305 = await LabFreeTime.findOne({ labNumber: 'LabF305' });
    
    if (!labF305) {
      console.log('❌ LabF305 not found in LabFreeTime table');
      return;
    }

    // Group slots by day
    const slotsByDay = {};
    labF305.freeTimeSlots.forEach(slot => {
      if (!slotsByDay[slot.day]) {
        slotsByDay[slot.day] = [];
      }
      slotsByDay[slot.day].push(slot);
    });

    // Display in requested format
    console.log('Lab F305');
    console.log('--------');
    
    ['Saturday', 'Sunday'].forEach(day => {
      if (slotsByDay[day] && slotsByDay[day].length > 0) {
        console.log(`${day.padEnd(12)} free`);
        
        slotsByDay[day].forEach(slot => {
          const startTime = slot.startTime.replace(':00', 'am').replace(':30', '30am');
          const endTime = slot.endTime.replace(':00', 'pm').replace(':30', '30pm');
          
          // Convert to 12-hour format
          const start12hr = convertTo12Hour(slot.startTime);
          const end12hr = convertTo12Hour(slot.endTime);
          
          console.log(`${start12hr.padEnd(12)} ${end12hr}`);
        });
        console.log(''); // Empty line after each day
      }
    });

    console.log('\n✅ Format completed!');
    
  } catch (error) {
    console.error('❌ Error displaying LabF305:', error);
  } finally {
    mongoose.connection.close();
  }
};

function convertTo12Hour(time24) {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'pm' : 'am';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

displayLabF305Format();
