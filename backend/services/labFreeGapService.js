const LabTimetable = require('../models/LabTimetable');
const LabFreeGapAlert = require('../models/LabFreeGapAlert');
const User = require('../models/User');

class LabFreeGapService {
  // Get current week number
  getCurrentWeekNumber() {
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
  async calculateGaps() {
    try {
      const labs = await LabTimetable.find({});
      console.log(`Processing ${labs.length} labs`);

      for (const lab of labs) {
        console.log(`\n=== Lab: ${lab.labName} ===`);
        console.log('Days structure:', JSON.stringify(lab.days, null, 2));
        
        for (const day in lab.days) {
          console.log(`\n--- Processing ${day} ---`);
          
          const freeSlots = lab.days[day].free || [];
          const busySlots = lab.days[day].busy || [];
          
          console.log(`Free slots: ${JSON.stringify(freeSlots)}`);
          console.log(`Busy slots: ${JSON.stringify(busySlots)}`);

          for (const free of freeSlots) {
            const duration = free.end - free.start;
            console.log(`Checking free slot: ${free.start}-${free.end} (${duration}h)`);

            if (duration > 3) {
              // Find busy slot that ends just before this free slot (handle gaps)
              const prevBusy = busySlots
                .filter(b => b.end <= free.start)
                .sort((a, b) => b.end - a.end)[0];

              console.log(`Previous busy slot found: ${JSON.stringify(prevBusy)}`);

              if (prevBusy) {
                // Find lecturer user to get real userId
                const lecturerUser = await User.findOne({
                  name: prevBusy.lecturerName,
                  role: 'lecturer'
                });

                if (!lecturerUser) {
                  console.log(`❌ Lecturer not found in Users collection: ${prevBusy.lecturerName}`);
                  continue;
                }

                // Use upsert to prevent duplicates
                await LabFreeGapAlert.updateOne(
                  { labName: lab.labName, day, start: free.start, end: free.end, weekNumber: this.getCurrentWeekNumber(), year: new Date().getFullYear() },
                  {
                    $set: {
                      duration,
                      lecturerName: prevBusy.lecturerName,
                      lecturerId: lecturerUser.userId, // Use real userId from Users collection
                      weekNumber: this.getCurrentWeekNumber(),
                      year: new Date().getFullYear(),
                      createdAt: new Date()
                    }
                  },
                  { upsert: true }
                );
                console.log(`✅ Upserted alert for ${prevBusy.lecturerName} (${lecturerUser.userId}): ${lab.labName} ${day} ${free.start}-${free.end} (${duration}h) Week ${this.getCurrentWeekNumber()}`);
              } else {
                console.log(`❌ No previous busy slot found for free slot ${free.start}-${free.end}`);
              }
            } else {
              console.log(`⏭️ Skipping free slot ${free.start}-${free.end} (duration: ${duration}h <= 3h)`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error calculating lab gaps:', error);
      throw error;
    }
  }

  async getAlertsForLecturer(lecturerId) {
    try {
      return await LabFreeGapAlert.find({ lecturerId }).sort({ day: 1, start: 1 });
    } catch (error) {
      console.error('Error getting alerts for lecturer:', error);
      throw error;
    }
  }

  // Keep old method for backward compatibility
  async getAlertsForLecturerByName(name) {
    try {
      return await LabFreeGapAlert.find({ lecturerName: name }).sort({ day: 1, start: 1 });
    } catch (error) {
      console.error('Error getting alerts for lecturer:', error);
      throw error;
    }
  }

  // Confirm alert for current week
  async confirmAlert(alertId) {
    try {
      const currentWeek = this.getCurrentWeekNumber();
      const currentYear = new Date().getFullYear();
      
      const result = await LabFreeGapAlert.updateOne(
        { 
          _id: alertId,
          weekNumber: currentWeek,
          year: currentYear
        },
        {
          $set: {
            confirmed: true,
            confirmedAt: new Date()
          }
        }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error confirming alert:', error);
      throw error;
    }
  }
}

module.exports = new LabFreeGapService();
