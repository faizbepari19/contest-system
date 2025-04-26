const { Prize, Contest, User, Participation, sequelize } = require('../models');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errorUtils');

/**
 * Create prizes for a contest
 * @param {number} contestId - Contest ID
 * @param {number} adminId - Admin user ID
 * @param {Array} prizes - Array of prize data (rank, prizeDetails)
 * @returns {Promise<Array>} Created prizes
 */
exports.createContestPrizes = async (contestId, adminId, prizes) => {
  // Verify the user is an admin
  const admin = await User.findByPk(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new ForbiddenError('Only admin users can create prizes');
  }

  // Check if contest exists
  const contest = await Contest.findByPk(contestId);
  if (!contest) {
    throw new NotFoundError('Contest not found');
  }

  // Use transaction to ensure data consistency
  const t = await sequelize.transaction();

  try {
    const createdPrizes = [];

    for (const prize of prizes) {
      const newPrize = await Prize.create(
        {
          contestId,
          userId: null, // Set to null initially, will be assigned when awarded
          rank: prize.rank,
          prizeDetails: prize.prizeDetails,
          awarded: false
        },
        { transaction: t }
      );

      createdPrizes.push(newPrize);
    }

    await t.commit();
    return createdPrizes;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Award prizes to winners of a contest
 * @param {number} contestId - Contest ID
 * @param {number} adminId - Admin user ID
 * @returns {Promise<Array>} Awarded prizes
 */
exports.awardContestPrizes = async (contestId, adminId) => {
  // Verify the user is an admin
  const admin = await User.findByPk(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new ForbiddenError('Only admin users can award prizes');
  }

  // Check if contest exists
  const contest = await Contest.findByPk(contestId);
  if (!contest) {
    throw new NotFoundError('Contest not found');
  }

  // Check if contest has ended
  const now = new Date();
  if (now < new Date(contest.endTime)) {
    throw new BadRequestError('Cannot award prizes before contest ends');
  }

  // Get prizes for this contest
  const prizes = await Prize.findAll({
    where: { contestId },
    order: [['rank', 'ASC']]
  });

  if (prizes.length === 0) {
    throw new BadRequestError('No prizes defined for this contest');
  }

  // Get top participants by score
  const topParticipants = await Participation.findAll({
    where: {
      contestId,
      status: 'submitted'
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }
    ],
    order: [
      ['score', 'DESC'],
      ['submittedAt', 'ASC'] // For ties, earlier submission wins
    ],
    limit: prizes.length
  });

  if (topParticipants.length === 0) {
    throw new BadRequestError('No participants found for this contest');
  }

  // Use transaction to ensure data consistency
  const t = await sequelize.transaction();

  try {
    // Award prizes to top participants
    const awardedPrizes = [];

    for (let i = 0; i < Math.min(prizes.length, topParticipants.length); i++) {
      const prize = prizes[i];
      const participant = topParticipants[i];

      // Skip if this prize is already awarded
      if (prize.awarded) {
        continue;
      }

      // Award prize
      prize.userId = participant.userId;
      prize.awarded = true;
      prize.awardedAt = new Date();
      await prize.save({ transaction: t });

      awardedPrizes.push({
        prize: prize.toJSON(),
        winner: {
          userId: participant.userId,
          username: participant.user.username,
          score: participant.score
        }
      });
    }

    await t.commit();
    
    return awardedPrizes;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Get all prizes for a contest
 * @param {number} contestId - Contest ID
 * @returns {Promise<Array>} Contest prizes
 */
exports.getContestPrizes = async (contestId) => {
  // Check if contest exists
  const contest = await Contest.findByPk(contestId);
  if (!contest) {
    throw new NotFoundError('Contest not found');
  }

  // Get prizes with winners
  const prizes = await Prize.findAll({
    where: { contestId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }
    ],
    order: [['rank', 'ASC']]
  });

  return {
    contestId,
    contestName: contest.name,
    prizes: prizes.map(prize => {
      const prizeData = prize.toJSON();
      return {
        id: prizeData.id,
        rank: prizeData.rank,
        prizeDetails: prizeData.prizeDetails,
        awarded: prizeData.awarded,
        awardedAt: prizeData.awardedAt,
        winner: prizeData.awarded && prizeData.user ? {
          id: prizeData.user.id,
          username: prizeData.user.username
        } : null
      };
    })
  };
};