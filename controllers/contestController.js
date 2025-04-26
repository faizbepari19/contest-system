const { Contest, Question, Option } = require('../models');
const contestService = require('../services/contestService');

/**
 * Get all contests with pagination
 * @route GET /api/contests
 * @access Public (filtered by access level)
 */
exports.getAllContests = async (req, res, next) => {
  try {
    const { page, limit, status, accessLevel } = req.query;
    const userRole = req.user ? req.user.role : 'guest';
    
    const contests = await contestService.getAllContests(
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
        accessLevel
      },
      userRole
    );
    
    res.status(200).json({
      status: 'success',
      data: contests
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single contest by ID
 * @route GET /api/contests/:id
 * @access Public/Private based on contest access level
 */
exports.getContestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user ? req.user.role : 'guest';
    
    const contest = await contestService.getContestById(id, userRole);
    
    res.status(200).json({
      status: 'success',
      data: contest
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new contest with questions and options
 * @route POST /api/contests
 * @access Private/Admin
 */
exports.createContest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { contest, questions } = req.body;
    
    if (!contest || !questions) {
      return res.status(400).json({
        status: 'error',
        message: 'Contest and questions data are required'
      });
    }
    
    const newContest = await contestService.createContest(userId, contest, questions);
    
    res.status(201).json({
      status: 'success',
      message: 'Contest created successfully',
      data: newContest
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update contest
 * @route PUT /api/contests/:id
 * @access Private/Admin
 */
exports.updateContest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const contestData = req.body;
    
    const updatedContest = await contestService.updateContest(userId, id, contestData);
    
    res.status(200).json({
      status: 'success',
      message: 'Contest updated successfully',
      data: updatedContest
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete contest
 * @route DELETE /api/contests/:id
 * @access Private/Admin
 */
exports.deleteContest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    await contestService.deleteContest(userId, id);
    
    res.status(200).json({
      status: 'success',
      message: 'Contest deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};