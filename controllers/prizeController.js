const prizeService = require('../services/prizeService');

/**
 * Create prizes for a contest
 * @route POST /api/prizes/contest/:contestId
 * @access Private/Admin
 */
exports.createContestPrizes = async (req, res, next) => {
  try {
    const { contestId } = req.params;
    const { prizes } = req.body;
    const adminId = req.user.id;
    
    if (!prizes || !Array.isArray(prizes) || prizes.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Prizes must be provided as a non-empty array'
      });
    }
    
    const createdPrizes = await prizeService.createContestPrizes(contestId, adminId, prizes);
    
    res.status(201).json({
      status: 'success',
      message: 'Contest prizes created successfully',
      data: createdPrizes
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Award prizes to winners of a contest
 * @route POST /api/prizes/contest/:contestId/award
 * @access Private/Admin
 */
exports.awardContestPrizes = async (req, res, next) => {
  try {
    const { contestId } = req.params;
    const adminId = req.user.id;
    
    const awardedPrizes = await prizeService.awardContestPrizes(contestId, adminId);
    
    res.status(200).json({
      status: 'success',
      message: 'Contest prizes awarded successfully',
      data: awardedPrizes
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all prizes for a contest
 * @route GET /api/prizes/contest/:contestId
 * @access Public
 */
exports.getContestPrizes = async (req, res, next) => {
  try {
    const { contestId } = req.params;
    
    const prizes = await prizeService.getContestPrizes(contestId);
    
    res.status(200).json({
      status: 'success',
      data: prizes
    });
  } catch (err) {
    next(err);
  }
};