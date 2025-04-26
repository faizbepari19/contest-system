const { Contest, Question, Option, User, sequelize } = require('../models');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errorUtils');

/**
 * Create a new contest with questions and options
 * @param {number} userId - Admin user ID
 * @param {Object} contestData - Contest data
 * @param {Array} questions - Questions with options
 * @returns {Promise<Object>} Created contest data
 */
exports.createContest = async (userId, contestData, questions) => {
  // Check if user is admin
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'admin') {
    throw new ForbiddenError('Only admin users can create contests');
  }

  // Use transaction to ensure data consistency
  const t = await sequelize.transaction();

  try {
    // Create contest
    const contest = await Contest.create(
      {
        ...contestData,
        creatorId: userId
      },
      { transaction: t }
    );

    // Create questions and options
    if (Array.isArray(questions) && questions.length > 0) {
      for (const q of questions) {
        // Validate question type
        if (!['single-select', 'multi-select', 'true-false'].includes(q.type)) {
          throw new BadRequestError(`Invalid question type: ${q.type}`);
        }

        // Create question
        const question = await Question.create(
          {
            text: q.text,
            type: q.type,
            contestId: contest.id
          },
          { transaction: t }
        );

        // Validate options
        if (!Array.isArray(q.options) || q.options.length === 0) {
          throw new BadRequestError('Questions must have at least one option');
        }

        // True/False questions must have exactly 2 options
        if (q.type === 'true-false' && q.options.length !== 2) {
          throw new BadRequestError('True/False questions must have exactly 2 options');
        }

        // Single-select questions must have at least 2 options
        if (q.type === 'single-select' && q.options.length < 2) {
          throw new BadRequestError('Single-select questions must have at least 2 options');
        }

        // Multi-select questions must have at least 2 options
        if (q.type === 'multi-select' && q.options.length < 2) {
          throw new BadRequestError('Multi-select questions must have at least 2 options');
        }

        // Ensure single-select and true-false have exactly one correct answer
        if (['single-select', 'true-false'].includes(q.type)) {
          const correctCount = q.options.filter(o => o.isCorrect).length;
          if (correctCount !== 1) {
            throw new BadRequestError(`${q.type} questions must have exactly one correct answer`);
          }
        }

        // Ensure multi-select has at least one correct answer
        if (q.type === 'multi-select') {
          const correctCount = q.options.filter(o => o.isCorrect).length;
          if (correctCount < 1) {
            throw new BadRequestError('Multi-select questions must have at least one correct answer');
          }
        }

        // Create options
        for (const o of q.options) {
          await Option.create(
            {
              text: o.text,
              isCorrect: o.isCorrect,
              questionId: question.id
            },
            { transaction: t }
          );
        }
      }
    } else {
      throw new BadRequestError('Contest must have at least one question');
    }

    await t.commit();

    // Return created contest
    return await Contest.findByPk(contest.id, {
      include: [
        {
          model: Question,
          as: 'questions',
          include: [
            {
              model: Option,
              as: 'options',
              attributes: ['id', 'text', 'isCorrect']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        }
      ]
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Get all contests with pagination
 * @param {Object} options - Filter and pagination options
 * @param {Object} userRole - User role for access control
 * @returns {Promise<Object>} Contests with pagination
 */
exports.getAllContests = async (options = {}, userRole = 'normal') => {
  const limit = options.limit || 10;
  const page = options.page || 1;
  const offset = (page - 1) * limit;
  const status = options.status; // Optional filter by status (upcoming, ongoing, ended)
  const accessLevel = options.accessLevel; // Optional filter by access level

  // Build where clause
  const where = {};
  
  // Filter by access level based on user role
  if (userRole !== 'admin' && userRole !== 'vip') {
    // Normal users can only see normal contests
    where.accessLevel = 'normal';
  } else if (accessLevel) {
    // Filter by specified access level if provided
    where.accessLevel = accessLevel;
  }

  // Filter by status if provided
  if (status) {
    const now = new Date();
    
    if (status === 'upcoming') {
      where.startTime = {
        [sequelize.Op.gt]: now
      };
    } else if (status === 'ongoing') {
      where.startTime = {
        [sequelize.Op.lte]: now
      };
      where.endTime = {
        [sequelize.Op.gt]: now
      };
    } else if (status === 'ended') {
      where.endTime = {
        [sequelize.Op.lte]: now
      };
    }
  }

  // Get contests
  const contests = await Contest.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username']
      }
    ],
    limit,
    offset,
    order: [['startTime', 'DESC']]
  });

  // Add virtual status field
  const contestsWithStatus = contests.rows.map(contest => {
    const contestObj = contest.toJSON();
    const now = new Date();
    if (now < new Date(contestObj.startTime)) {
      contestObj.status = 'upcoming';
    } else if (now >= new Date(contestObj.startTime) && now <= new Date(contestObj.endTime)) {
      contestObj.status = 'ongoing';
    } else {
      contestObj.status = 'ended';
    }
    return contestObj;
  });

  return {
    pagination: {
      total: contests.count,
      page,
      limit,
      pages: Math.ceil(contests.count / limit)
    },
    contests: contestsWithStatus
  };
};

/**
 * Get contest by ID
 * @param {number} contestId - Contest ID
 * @param {string} userRole - User role for access control
 * @returns {Promise<Object>} Contest data
 */
exports.getContestById = async (contestId, userRole = 'normal') => {
  // Get contest with creator and questions
  const contest = await Contest.findByPk(contestId, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username']
      },
      {
        model: Question,
        as: 'questions',
        include: [
          {
            model: Option,
            as: 'options',
            // Hide correct answer for non-admin users
            attributes: userRole === 'admin' 
              ? ['id', 'text', 'isCorrect'] 
              : ['id', 'text']
          }
        ]
      }
    ]
  });

  if (!contest) {
    throw new NotFoundError('Contest not found');
  }

  // Check access level
  if (contest.accessLevel === 'vip' && userRole !== 'vip' && userRole !== 'admin') {
    throw new ForbiddenError('This contest requires VIP access');
  }

  // Add virtual status field
  const now = new Date();
  let status;
  if (now < new Date(contest.startTime)) {
    status = 'upcoming';
  } else if (now >= new Date(contest.startTime) && now <= new Date(contest.endTime)) {
    status = 'ongoing';
  } else {
    status = 'ended';
  }

  const contestData = contest.toJSON();
  contestData.status = status;

  return contestData;
};

/**
 * Update a contest
 * @param {number} userId - Admin user ID
 * @param {number} contestId - Contest ID
 * @param {Object} contestData - Updated contest data
 * @returns {Promise<Object>} Updated contest
 */
exports.updateContest = async (userId, contestId, contestData) => {
  // Check if user is admin
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'admin') {
    throw new ForbiddenError('Only admin users can update contests');
  }

  // Get contest
  const contest = await Contest.findByPk(contestId);
  if (!contest) {
    throw new NotFoundError('Contest not found');
  }

  // Update contest
  await contest.update(contestData);

  // Return updated contest
  return await Contest.findByPk(contestId, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username']
      }
    ]
  });
};

/**
 * Delete a contest
 * @param {number} userId - Admin user ID
 * @param {number} contestId - Contest ID
 * @returns {Promise<boolean>} Success indicator
 */
exports.deleteContest = async (userId, contestId) => {
  // Check if user is admin
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'admin') {
    throw new ForbiddenError('Only admin users can delete contests');
  }

  // Get contest
  const contest = await Contest.findByPk(contestId);
  if (!contest) {
    throw new NotFoundError('Contest not found');
  }

  // Delete contest
  await contest.destroy();
  return true;
};