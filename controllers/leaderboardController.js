const leaderboardService = require('../services/leaderboardService');
const { Participation, Contest } = require('../models');

/**
 * Get leaderboard for a specific contest
 * @route GET /api/leaderboard/:contestId
 * @access Public
 */
exports.getContestLeaderboard = async (req, res, next) => {
  try {
    const { contestId } = req.params;
    const { page, limit } = req.query;
    
    // Get leaderboard data
    const leaderboard = await leaderboardService.getContestLeaderboard(
      contestId,
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: leaderboard
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get contest participation history for a user
 * @route GET /api/leaderboard/user/history
 * @access Private
 */
exports.getUserContestHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, status } = req.query;
    
    // Get user's contest history
    const history = await leaderboardService.getUserContestHistory(
      userId,
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: history
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user's in-progress contests
 * @route GET /api/leaderboard/user/in-progress
 * @access Private
 */
exports.getUserInProgressContests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user's in-progress participations
    const participations = await Participation.findAll({
      where: {
        userId,
        status: 'in-progress'
      },
      include: [
        {
          model: Contest,
          as: 'contest',
          attributes: ['id', 'name', 'description', 'startTime', 'endTime']
        }
      ]
    });
    
    // Filter out contests that have already ended
    const now = new Date();
    const activeParticipations = participations.filter(p => 
      new Date(p.contest.endTime) > now
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        count: activeParticipations.length,
        participations: activeParticipations.map(p => ({
          id: p.id,
          contestId: p.contest.id,
          contestName: p.contest.name,
          description: p.contest.description,
          startedAt: p.startedAt,
          endsAt: p.contest.endTime
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get prizes won by the authenticated user
 * @route GET /api/leaderboard/user/prizes
 * @access Private
 */
exports.getUserPrizes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { Prize, Contest } = require('../models');
    
    // Get all prizes won by the user
    const prizes = await Prize.findAll({
      where: { userId },
      include: [
        {
          model: Contest,
          as: 'contest',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        count: prizes.length,
        prizes: prizes.map(prize => ({
          id: prize.id,
          contestId: prize.contestId,
          contestName: prize.contest.name,
          description: prize.description,
          rank: prize.rank,
          awardedAt: prize.createdAt
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};