const { User, Contest, Participation, sequelize, Sequelize } = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/errorUtils');
const { cacheOrExecute, clearCacheByPattern } = require('../utils/cacheUtils');
const Op = Sequelize.Op;

/**
 * Get leaderboard for a specific contest
 * @param {number} contestId - Contest ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Leaderboard data with pagination
 */
exports.getContestLeaderboard = async (contestId, options = {}) => {
  const limit = options.limit || 10;
  const page = options.page || 1;
  const offset = (page - 1) * limit;
  
  // Check if contest exists
  const contest = await Contest.findByPk(contestId);
  if (!contest) {
    throw new NotFoundError('Contest not found');
  }
  
  // Determine if contest has ended (for cache TTL decision)
  const now = new Date();
  const isContestEnded = now > new Date(contest.endTime);
  
  // Create a cache key using contestId and pagination params
  const cacheKey = `leaderboard:${contestId}:page${page}:limit${limit}`;
  
  // Define the function that fetches the data
  const fetchLeaderboardData = async () => {
    // Get leaderboard data with user info and total score
    const leaderboard = await Participation.findAndCountAll({
      where: {
        contestId,
        status: 'submitted' // Only include completed participations
      },
      attributes: [
        'id',
        'userId',
        'contestId',
        'score',
        'submittedAt'
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ],
      order: [
        ['score', 'DESC'], // Sort by score (highest first)
        ['submittedAt', 'ASC'] // For tied scores, sort by submission time (earliest first)
      ],
      limit,
      offset
    });

    // Format the response with pagination data
    return {
      contest: {
        id: contest.id,
        name: contest.name,
        status: isContestEnded ? 'ended' : (now >= new Date(contest.startTime) ? 'ongoing' : 'upcoming')
      },
      pagination: {
        total: leaderboard.count,
        page,
        limit,
        pages: Math.ceil(leaderboard.count / limit)
      },
      rankings: leaderboard.rows.map((participation, index) => ({
        rank: offset + index + 1,
        userId: participation.userId,
        username: participation.user.username,
        score: participation.score,
        submittedAt: participation.submittedAt
      }))
    };
  };
  
  // Use caching wrapper with appropriate TTL based on contest status
  // Cache for 1 hour if ended, 1 minute if ongoing
  const cacheTTL = isContestEnded ? 3600 : 60;
  return cacheOrExecute(cacheKey, fetchLeaderboardData, cacheTTL);
};

/**
 * Invalidate leaderboard cache when scores are updated
 * @param {number} contestId - Contest ID
 */
exports.invalidateLeaderboardCache = (contestId) => {
  clearCacheByPattern(`leaderboard:${contestId}:`);
};

/**
 * Get user contest history with rankings
 * @param {number} userId - User ID
 * @param {Object} options - Filter and pagination options
 * @returns {Promise<Object>} User contest history with pagination
 */
exports.getUserContestHistory = async (userId, options = {}) => {
  const limit = options.limit || 10;
  const page = options.page || 1;
  const offset = (page - 1) * limit;
  const status = options.status; // Optional filter by participation status

  // Create a cache key
  const cacheKey = `user:${userId}:history:page${page}:limit${limit}:status${status || 'all'}`;
  
  // Use caching wrapper
  return cacheOrExecute(cacheKey, async () => {
    // Build the where clause
    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    // Get user's contest participation history
    const history = await Participation.findAndCountAll({
      where: whereClause,
      attributes: [
        'id',
        'contestId',
        'userId',
        'score',
        'status',
        'submittedAt'
      ],
      include: [
        {
          model: Contest,
          as: 'contest',
          attributes: ['id', 'name', 'startTime', 'endTime', 'accessLevel']
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit,
      offset
    });

    // Get contest ranks for each participation
    const participationsWithRank = await Promise.all(
      history.rows.map(async (participation) => {
        // Only calculate rank for submitted participations
        let rank = null;
        if (participation.status === 'submitted') {
          // Count number of participations with higher scores
          const higherScores = await Participation.count({
            where: {
              contestId: participation.contestId,
              status: 'submitted',
              score: {
                [Op.gt]: participation.score
              }
            }
          });
          
          // Get tied scores submitted earlier
          const tiedButEarlier = await Participation.count({
            where: {
              contestId: participation.contestId,
              status: 'submitted',
              score: participation.score,
              submittedAt: {
                [Op.lt]: participation.submittedAt
              }
            }
          });
          
          rank = higherScores + tiedButEarlier + 1;
        }
        
        return {
          id: participation.id,
          contestId: participation.contestId,
          contestName: participation.contest.name,
          status: participation.status,
          score: participation.score,
          rank,
          submittedAt: participation.submittedAt
        };
      })
    );

    return {
      pagination: {
        total: history.count,
        page,
        limit,
        pages: Math.ceil(history.count / limit)
      },
      history: participationsWithRank
    };
  }, 300); // Cache for 5 minutes
};

/**
 * Invalidate user history cache when user participates in a contest
 * @param {number} userId - User ID
 */
exports.invalidateUserHistoryCache = (userId) => {
  clearCacheByPattern(`user:${userId}:history:`);
};