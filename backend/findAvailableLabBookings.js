const mongoose = require('mongoose');
const StudentFreeTime = require('./models/StudentFreeTime');
const LabFreeTime = require('./models/LabFreeTime');
const LabBooking = require('./models/LabBooking');
const { connectDB } = require('./config/database');

// Find available lab booking times for students
const findAvailableLabBookings = async () => {
  try {
    await connectDB();
    console.log('🔄 Finding available lab booking times...');

    // Get all student free times
    const studentFreeTimes = await StudentFreeTime.find({});
    console.log(`📊 Found ${studentFreeTimes.length} students with free time data`);

    // Get all lab free times
    const labFreeTimes = await LabFreeTime.find({});
    console.log(`📊 Found ${labFreeTimes.length} labs with free time data`);

    const availableBookings = [];

    for (const studentFreeTime of studentFreeTimes) {
      console.log(`🔍 Processing ${studentFreeTime.studentIdentifier}...`);

      // Group student free slots by day
      const studentFreeSlotsByDay = {};
      studentFreeTime.freeTimeSlots.forEach(slot => {
        if (!studentFreeSlotsByDay[slot.day]) {
          studentFreeSlotsByDay[slot.day] = [];
        }
        studentFreeSlotsByDay[slot.day].push(slot);
      });

      for (const labFreeTime of labFreeTimes) {
        // Group lab free slots by day
        const labFreeSlotsByDay = {};
        labFreeTime.freeTimeSlots.forEach(slot => {
          if (!labFreeSlotsByDay[slot.day]) {
            labFreeSlotsByDay[slot.day] = [];
          }
          labFreeSlotsByDay[slot.day].push(slot);
        });

        // Find matching free time slots for each day
        for (const day of ['Saturday', 'Sunday']) {
          const studentSlots = studentFreeSlotsByDay[day] || [];
          const labSlots = labFreeSlotsByDay[day] || [];

          console.log(`  📅 ${day}: Student has ${studentSlots.length} slots, Lab ${labFreeTime.labNumber} has ${labSlots.length} slots`);

          // Find overlapping free times between student and lab
          const overlappingSlots = findOverlappingTimeSlots(studentSlots, labSlots);

          overlappingSlots.forEach(overlap => {
            availableBookings.push({
              studentIdentifier: studentFreeTime.studentIdentifier,
              labNumber: labFreeTime.labNumber,
              day: day,
              date: getNextDateForDay(day), // Get next occurrence of this day
              startTime: overlap.startTime,
              endTime: overlap.endTime,
              duration: calculateDuration(overlap.startTime, overlap.endTime),
              reason: `Available for booking`,
              priority: 'high',
              matchType: 'student_lab_free_time_match'
            });
          });
        }
      }
    }

    // Sort available bookings by priority and date
    availableBookings.sort((a, b) => {
      // First by day of week
      const dayOrder = ['Saturday', 'Sunday'];
      const aDayIndex = dayOrder.indexOf(a.day);
      const bDayIndex = dayOrder.indexOf(b.day);
      
      if (aDayIndex !== bDayIndex) {
        return aDayIndex - bDayIndex;
      }
      
      // Then by start time
      return a.startTime.localeCompare(b.startTime);
    });

    console.log(`🎯 Found ${availableBookings.length} available lab booking opportunities`);

    // Display results in the requested format
    displayAvailableBookings(availableBookings);

    // Save to database
    await saveAvailableBookings(availableBookings);

    console.log('\n✅ Available lab booking times calculated and stored!');

  } catch (error) {
    console.error('❌ Error finding available lab bookings:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Find overlapping time slots between student and lab free times
function findOverlappingTimeSlots(studentSlots, labSlots) {
  const overlappingSlots = [];

  studentSlots.forEach(studentSlot => {
    labSlots.forEach(labSlot => {
      const studentStart = timeToMinutes(studentSlot.startTime);
      const studentEnd = timeToMinutes(studentSlot.endTime);
      const labStart = timeToMinutes(labSlot.startTime);
      const labEnd = timeToMinutes(labSlot.endTime);

      // Find overlap: later start time, earlier end time
      const overlapStart = Math.max(studentStart, labStart);
      const overlapEnd = Math.min(studentEnd, labEnd);

      if (overlapStart < overlapEnd) {
        const duration = overlapEnd - overlapStart;
        if (duration >= 60) { // Minimum 1 hour
          overlappingSlots.push({
            startTime: minutesToTime(overlapStart),
            endTime: minutesToTime(overlapEnd),
            duration: duration,
            studentSlot: studentSlot,
            labSlot: labSlot
          });
        }
      }
    });
  });

  return overlappingSlots;
}

// Convert time string to minutes
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert minutes to time string
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Calculate duration in hours
function calculateDuration(startTime, endTime) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return Math.round((end - start) / 60 * 10) / 10; // Round to 1 decimal
}

// Get next date for a specific day
function getNextDateForDay(day) {
  const today = new Date();
  const todayDay = today.toLocaleDateString('en-US', { weekday: 'long' });
  const targetDay = day;
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = daysOfWeek.indexOf(todayDay);
  const targetIndex = daysOfWeek.indexOf(targetDay);
  
  let daysToAdd = targetIndex - todayIndex;
  if (daysToAdd <= 0) {
    daysToAdd += 7; // Next week
  }
  
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysToAdd);
  return nextDate;
}

// Display available bookings in requested format
function displayAvailableBookings(bookings) {
  console.log('\n📋 Available Lab Booking Times:');
  console.log('=====================================');

  // Group by student
  const bookingsByStudent = {};
  bookings.forEach(booking => {
    if (!bookingsByStudent[booking.studentIdentifier]) {
      bookingsByStudent[booking.studentIdentifier] = [];
    }
    bookingsByStudent[booking.studentIdentifier].push(booking);
  });

  Object.entries(bookingsByStudent).forEach(([studentId, studentBookings]) => {
    console.log(`\n👤 Student: ${studentId}`);
    
    // Group by lab
    const bookingsByLab = {};
    studentBookings.forEach(booking => {
      if (!bookingsByLab[booking.labNumber]) {
        bookingsByLab[booking.labNumber] = [];
      }
      bookingsByLab[booking.labNumber].push(booking);
    });

    Object.entries(bookingsByLab).forEach(([labNumber, labBookings]) => {
      console.log(`  🏢 ${labNumber}:`);
      
      labBookings.forEach(booking => {
        const startTime = format12Hour(booking.startTime);
        const endTime = format12Hour(booking.endTime);
        console.log(`    ${booking.day} ${startTime} - ${endTime} (${booking.duration} hours)`);
      });
    });
  });
}

// Format time to 12-hour format
function format12Hour(time24) {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Save available bookings to database
async function saveAvailableBookings(bookings) {
  try {
    // Clear existing available bookings
    await LabBooking.deleteMany({ status: 'available' });
    
    // Insert new available bookings
    const bookingDocs = bookings.map(booking => ({
      ...booking,
      status: 'available',
      purpose: 'Available for booking'
    }));

    await LabBooking.insertMany(bookingDocs);
    console.log(`💾 Saved ${bookingDocs.length} available booking opportunities to database`);
  } catch (error) {
    console.error('❌ Error saving available bookings:', error);
  }
}

// Run the analysis
findAvailableLabBookings();
