const express = require('express');
const router = express.Router();
const {
  rebuildLabStudentCommonFreeTable,
  getCommonFreeForStudentGroup,
  getStudentGroupsForLab
} = require('../services/labStudentCommonFreeService');

/**
 * POST /api/lab-student-common-free/rebuild
 * Rebuild the entire lab-student common free time table
 */
router.post('/rebuild', async (req, res) => {
  try {
    const result = await rebuildLabStudentCommonFreeTable();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error in rebuild route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during rebuild',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/lab-student-common-free/student/:year/:semester/:batch/:specialization/:group
 * Get common free slots for a specific student group
 */
router.get('/student/:year/:semester/:batch/:specialization/:group', async (req, res) => {
  try {
    const { year, semester, batch, specialization, group } = req.params;
    
    const commonFreeData = await getCommonFreeForStudentGroup(
      year, semester, batch, specialization, group
    );
    
    if (commonFreeData) {
      res.status(200).json({
        success: true,
        data: commonFreeData,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No common free slots found for this student group',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error fetching student group common free data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/lab-student-common-free/lab/:labName
 * Get all student groups that have common free slots with a specific lab
 */
router.get('/lab/:labName', async (req, res) => {
  try {
    const { labName } = req.params;
    
    const studentGroups = await getStudentGroupsForLab(labName);
    
    if (studentGroups.length > 0) {
      res.status(200).json({
        success: true,
        data: studentGroups,
        count: studentGroups.length,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No student groups found with common free slots for this lab',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error fetching student groups for lab:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/lab-student-common-free/available-labs
 * Get all labs that have common free slots with any student group
 */
router.get('/available-labs', async (req, res) => {
  try {
    const LabStudentCommonFree = require('../models/LabStudentCommonFree');
    
    // Get all distinct lab names from the collection
    const labs = await LabStudentCommonFree.aggregate([
      { $unwind: '$labs' },
      { $group: { _id: '$labs.labName' } },
      { $sort: { _id: 1 } }
    ]);
    
    const labNames = labs.map(lab => lab._id);
    
    res.status(200).json({
      success: true,
      data: labNames,
      count: labNames.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching available labs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/lab-student-common-free/student-groups
 * Get all student groups that have common free slots
 */
router.get('/student-groups', async (req, res) => {
  try {
    const LabStudentCommonFree = require('../models/LabStudentCommonFree');
    
    const studentGroups = await LabStudentCommonFree.find({})
      .select('year semester batch specialization group')
      .sort({ year: 1, semester: 1, batch: 1, specialization: 1, group: 1 });
    
    res.status(200).json({
      success: true,
      data: studentGroups,
      count: studentGroups.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching student groups:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
