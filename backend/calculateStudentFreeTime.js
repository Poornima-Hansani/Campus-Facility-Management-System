const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const User = require('./models/User');
const { connectDB } = require('./config/database');

// Student Free Time model
const studentFreeTimeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make optional for now
  },
  studentIdentifier: {
    type: String,
    required: true // e.g., "Y1_S1_WE_1.1"
  },
  freeTimeSlots: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      default: 'Free time'
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    isBookable: {
      type: Boolean,
      default: true
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const StudentFreeTime = mongoose.model('StudentFreeTime', studentFreeTimeSchema);

// Calculate free time for all students
const calculateStudentFreeTime = async () => {
  try {
    await connectDB();
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
    console.log('📊 Summary:');
    results.forEach(result => {
      if (result.success) {
        console.log(`  ✅ ${result.studentIdentifier}: ${result.freeSlotsCount} free slots`);
        console.log(`     (${result.timetableInfo.batchType} ${result.timetableInfo.faculty} Y${result.timetableInfo.year}S${result.timetableInfo.semester} G${result.timetableInfo.group})`);
      } else {
        console.log(`  ❌ ${result.studentIdentifier}: ${result.error}`);
      }
    });
    
    console.log('\n🎉 Student free time data successfully stored in StudentFreeTime collection!');
    
  } catch (error) {
    console.error('❌ Error in calculateStudentFreeTime:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the calculation
calculateStudentFreeTime();
