const StudentTimeTable = require('../models/StudentTimeTable');
const LabTimetable = require('../models/LabTimetable');
const LabStudentCommonFree = require('../models/LabStudentCommonFree');

/**
 * Calculate intersection between two time slots
 * @param {Number} slot1Start - Start time of first slot
 * @param {Number} slot1End - End time of first slot
 * @param {Number} slot2Start - Start time of second slot
 * @param {Number} slot2End - End time of second slot
 * @returns {Object|null} - Intersection slot or null if no overlap
 */
function calculateIntersection(slot1Start, slot1End, slot2Start, slot2End) {
  const overlapStart = Math.max(slot1Start, slot2Start);
  const overlapEnd = Math.min(slot1End, slot2End);
  
  if (overlapStart < overlapEnd) {
    return { start: overlapStart, end: overlapEnd };
  }
  
  return null;
}

/**
 * Find all common free slots between student and lab for a specific day
 * @param {Array} studentFreeSlots - Student free slots for the day
 * @param {Array} labFreeSlots - Lab free slots for the day
 * @returns {Array} - Array of common free slots
 */
function findCommonFreeSlots(studentFreeSlots, labFreeSlots) {
  const commonSlots = [];
  
  for (const studentSlot of studentFreeSlots) {
    for (const labSlot of labFreeSlots) {
      const intersection = calculateIntersection(
        studentSlot.start, studentSlot.end,
        labSlot.start, labSlot.end
      );
      
      if (intersection) {
        commonSlots.push(intersection);
      }
    }
  }
  
  return commonSlots;
}

/**
 * Build the lab-student common free time table
 * This function compares freeTime[day].free from StudentTimeTable
 * with days[day].free from LabTimetable
 */
async function rebuildLabStudentCommonFreeTable() {
  try {
    console.log('Starting rebuild of LabStudentCommonFree table...');
    
    // Clear existing data
    await LabStudentCommonFree.deleteMany({});
    console.log('Cleared existing LabStudentCommonFree data');
    
    // Get all student timetables
    const studentTimetables = await StudentTimeTable.find({});
    console.log(`Found ${studentTimetables.length} student timetables`);
    
    // Get all lab timetables
    const labTimetables = await LabTimetable.find({});
    console.log(`Found ${labTimetables.length} lab timetables`);
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Process each student timetable
    for (const studentTimetable of studentTimetables) {
      const studentGroupData = {
        year: studentTimetable.year,
        semester: studentTimetable.semester,
        batch: studentTimetable.batch,
        specialization: studentTimetable.specialization,
        group: studentTimetable.group,
        labs: []
      };
      
      // For each lab timetable
      for (const labTimetable of labTimetables) {
        const labData = {
          labName: labTimetable.labName,
          days: {}
        };
        
        let hasCommonSlots = false;
        
        // For each day
        for (const day of days) {
          const studentFreeSlots = studentTimetable.freeTime[day]?.free || [];
          const labFreeSlots = labTimetable.days[day]?.free || [];
          
          const commonSlots = findCommonFreeSlots(studentFreeSlots, labFreeSlots);
          
          if (commonSlots.length > 0) {
            labData.days[day] = commonSlots;
            hasCommonSlots = true;
          }
        }
        
        // Only add lab if there are common free slots
        if (hasCommonSlots) {
          studentGroupData.labs.push(labData);
        }
      }
      
      // Only save if there are labs with common slots
      if (studentGroupData.labs.length > 0) {
        const commonFreeRecord = new LabStudentCommonFree(studentGroupData);
        await commonFreeRecord.save();
        console.log(`Saved common free data for ${studentTimetable.year}-${studentTimetable.semester}-${studentTimetable.batch}-${studentTimetable.specialization}-${studentTimetable.group}`);
      }
    }
    
    console.log('LabStudentCommonFree table rebuild completed successfully');
    return { success: true, message: 'LabStudentCommonFree table rebuilt successfully' };
    
  } catch (error) {
    console.error('Error rebuilding LabStudentCommonFree table:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Get common free slots for a specific student group
 * @param {String} year - Year
 * @param {String} semester - Semester
 * @param {String} batch - Batch
 * @param {String} specialization - Specialization
 * @param {String} group - Group
 * @returns {Object|null} - Common free data or null
 */
async function getCommonFreeForStudentGroup(year, semester, batch, specialization, group) {
  try {
    const commonFree = await LabStudentCommonFree.findOne({
      year,
      semester,
      batch,
      specialization,
      group
    });
    
    return commonFree;
  } catch (error) {
    console.error('Error fetching common free data:', error);
    throw error;
  }
}

/**
 * Get all student groups that have common free slots with a specific lab
 * @param {String} labName - Lab name
 * @returns {Array} - Array of student groups with their common free slots
 */
async function getStudentGroupsForLab(labName) {
  try {
    const results = await LabStudentCommonFree.find({
      'labs.labName': labName
    }).select('year semester batch specialization group labs');
    
    // Filter to only include the specific lab
    const filteredResults = results.map(record => {
      const filteredRecord = {
        year: record.year,
        semester: record.semester,
        batch: record.batch,
        specialization: record.specialization,
        group: record.group,
        lab: record.labs.find(lab => lab.labName === labName)
      };
      return filteredRecord;
    });
    
    return filteredResults;
  } catch (error) {
    console.error('Error fetching student groups for lab:', error);
    throw error;
  }
}

module.exports = {
  rebuildLabStudentCommonFreeTable,
  getCommonFreeForStudentGroup,
  getStudentGroupsForLab,
  calculateIntersection,
  findCommonFreeSlots
};
