const LabStudentCommonFree = require('../models/LabStudentCommonFree');
const StudentTimeTable = require('../models/StudentTimeTable');
const LabTimetable = require('../models/LabTimetable');

/**
 * Rebuild common free slots for ONE specific student group (SAFE approach)
 * This is the correct way - update only the affected group, don't wipe entire collection
 */
async function rebuildForOneGroup(studentTimetable) {
  try {
    const { year, semester, batch, specialization, group } = studentTimetable;
    
    // Get all lab timetables
    const labTimetables = await LabTimetable.find({});
    
    if (labTimetables.length === 0) {
      console.log(`No lab timetables found for group ${year}/${semester}/${batch}/${specialization}/${group}`);
      return { success: false, message: 'No lab timetables found' };
    }
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const labCommonFreeSlots = [];
    
    // Calculate common free slots for each lab
    for (const labTimetable of labTimetables) {
      const labName = labTimetable.labName;
      const labFreeSlots = {};
      
      for (const day of days) {
        const studentFreeSlots = studentTimetable.freeTime?.[day]?.free || [];
        const labFreeSlotsForDay = labTimetable.days?.[day]?.free || [];
        
        const commonSlots = findTimeIntersections(studentFreeSlots, labFreeSlotsForDay);
        
        if (commonSlots.length > 0) {
          labFreeSlots[day] = commonSlots;
        }
      }
      
      if (Object.keys(labFreeSlots).length > 0) {
        labCommonFreeSlots.push({
          labName,
          days: labFreeSlots
        });
      }
    }
    
    // CRITICAL FIX: Remove ghost records when no common free slots exist
    if (labCommonFreeSlots.length === 0) {
      // No common free time anymore -> remove the group completely
      await LabStudentCommonFree.deleteOne({
        year, semester, batch, specialization, group
      });
      
      console.log(`Removed group ${year}/${semester}/${batch}/${specialization}/${group} - no common free slots`);
      
      return {
        success: true,
        message: `Removed group ${year}/${semester}/${batch}/${specialization}/${group} - no common free slots`,
        labsCount: 0
      };
    } else {
      // Update or insert normally
      await LabStudentCommonFree.findOneAndUpdate(
        { year, semester, batch, specialization, group },
        {
          year,
          semester,
          batch,
          specialization,
          group,
          labs: labCommonFreeSlots,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
      
      console.log(`Updated group ${year}/${semester}/${batch}/${specialization}/${group} with ${labCommonFreeSlots.length} labs`);
    }
    
    return {
      success: true,
      message: `Updated group ${year}/${semester}/${batch}/${specialization}/${group}`,
      labsCount: labCommonFreeSlots.length
    };
    
  } catch (error) {
    console.error('Error rebuilding for one group:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

/**
 * Rebuild the entire lab-student common free time table
 */
async function rebuildLabStudentCommonFreeTable() {
  try {
    console.log('Starting LabStudentCommonFree table rebuild...');
    
    // Get all student timetables
    const studentTimetables = await StudentTimeTable.find({});
    console.log(`Found ${studentTimetables.length} student timetables`);
    
    // Get all lab timetables
    const labTimetables = await LabTimetable.find({});
    console.log(`Found ${labTimetables.length} lab timetables`);
    
    if (studentTimetables.length === 0 || labTimetables.length === 0) {
      console.log('No source data found. Skipping rebuild to avoid clearing collection.');
      return {
        success: false,
        message: 'No student or lab timetables found to process'
      };
    }
    
    // DANGEROUS: Never delete entire collection for single timetable changes
    // await LabStudentCommonFree.deleteMany({});
    // console.log('Cleared existing LabStudentCommonFree data');
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let totalProcessed = 0;
    
    // Process each student group
    for (const studentTimetable of studentTimetables) {
      const { year, semester, batch, specialization, group } = studentTimetable;
      
      // Find common free slots for each lab
      const labCommonFreeSlots = [];
      
      for (const labTimetable of labTimetables) {
        const labName = labTimetable.labName;
        const labFreeSlots = {};
        
        // Calculate common free time for each day
        for (const day of days) {
          const studentFreeSlots = studentTimetable.freeTime?.[day]?.free || [];
          const labFreeSlotsForDay = labTimetable.days?.[day]?.free || [];
          
          // Find intersection of student and lab free time
          const commonSlots = findTimeIntersections(studentFreeSlots, labFreeSlotsForDay);
          
          if (commonSlots.length > 0) {
            labFreeSlots[day] = commonSlots;
          }
        }
        
        // Only include lab if there are common free slots
        if (Object.keys(labFreeSlots).length > 0) {
          labCommonFreeSlots.push({
            labName,
            days: labFreeSlots
          });
        }
      }
      
      // Only create entry if there are common free slots
      if (labCommonFreeSlots.length > 0) {
        await LabStudentCommonFree.findOneAndUpdate(
          { year, semester, batch, specialization, group },
          {
            year,
            semester,
            batch,
            specialization,
            group,
            labs: labCommonFreeSlots,
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );
        
        totalProcessed++;
        console.log(`Processed student group: ${year}/${semester}/${batch}/${specialization}/${group}`);
      }
    }
    
    console.log(`LabStudentCommonFree table rebuild completed. Processed ${totalProcessed} student groups.`);
    
    return {
      success: true,
      message: `Successfully rebuilt LabStudentCommonFree table. Processed ${totalProcessed} student groups.`
    };
    
  } catch (error) {
    console.error('Error rebuilding LabStudentCommonFree table:', error);
    return {
      success: false,
      message: `Error during rebuild: ${error.message}`
    };
  }
}

/**
 * Find intersections between two arrays of time slots
 */
function findTimeIntersections(slots1, slots2) {
  const intersections = [];
  
  for (const slot1 of slots1) {
    for (const slot2 of slots2) {
      const intersection = findIntersection(slot1, slot2);
      if (intersection) {
        intersections.push(intersection);
      }
    }
  }
  
  return intersections;
}

/**
 * Find intersection between two time slots
 */
function findIntersection(slot1, slot2) {
  const start = Math.max(slot1.start, slot2.start);
  const end = Math.min(slot1.end, slot2.end);
  
  if (start < end) {
    return { start, end };
  }
  
  return null;
}

/**
 * Get common free slots for a specific student group
 */
async function getCommonFreeForStudentGroup(year, semester, batch, specialization, group) {
  try {
    const commonFreeData = await LabStudentCommonFree.findOne({
      year,
      semester,
      batch,
      specialization,
      group
    });
    
    return commonFreeData;
  } catch (error) {
    console.error('Error fetching common free data for student group:', error);
    throw error;
  }
}

/**
 * Get all student groups that have common free slots with a specific lab
 */
async function getStudentGroupsForLab(labName) {
  try {
    const studentGroups = await LabStudentCommonFree.aggregate([
      { $unwind: '$labs' },
      { $match: { 'labs.labName': labName } },
      {
        $project: {
          year: 1,
          semester: 1,
          batch: 1,
          specialization: 1,
          group: 1,
          commonFreeSlots: '$labs.days'
        }
      },
      { $sort: { year: 1, semester: 1, batch: 1, specialization: 1, group: 1 } }
    ]);
    
    return studentGroups;
  } catch (error) {
    console.error('Error fetching student groups for lab:', error);
    throw error;
  }
}

module.exports = {
  rebuildLabStudentCommonFreeTable,
  rebuildForOneGroup,  // SAFE: Update only one group, don't wipe collection
  getCommonFreeForStudentGroup,
  getStudentGroupsForLab
};
