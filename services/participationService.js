const { 
  User, 
  Contest, 
  Question, 
  Option, 
  Participation, 
  Answer, 
  AnswerOption, 
  sequelize 
} = require('../models');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errorUtils');
const { invalidateLeaderboardCache, invalidateUserHistoryCache } = require('./leaderboardService');

/**
 * Join a contest
 * @param {number} userId - User ID
 * @param {number} contestId - Contest ID
 * @returns {Promise<Object>} New participation data
 */
exports.joinContest = async (userId, contestId) => {
  // Use transaction to ensure data consistency
  const t = await sequelize.transaction();

  try {
    // Get user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get contest with questions
    const contest = await Contest.findByPk(contestId, {
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
        }
      ]
    });

    if (!contest) {
      throw new NotFoundError('Contest not found');
    }

    // Check access level
    if (contest.accessLevel === 'vip' && user.role !== 'vip' && user.role !== 'admin') {
      throw new ForbiddenError('This contest requires VIP access');
    }

    // Check if contest has started
    const now = new Date();
    if (new Date(contest.startTime) > now) {
      throw new BadRequestError('Contest has not started yet');
    }

    // Check if contest has ended
    if (new Date(contest.endTime) < now) {
      throw new BadRequestError('Contest has already ended');
    }

    // Check if user already has an active participation
    const existingParticipation = await Participation.findOne({
      where: {
        userId,
        contestId,
      }
    });

    if (existingParticipation) {
      // If participation exists but not submitted, return the existing one
      if (existingParticipation.status !== 'submitted') {
        await t.commit();
        return existingParticipation;
      }
      throw new BadRequestError('You have already submitted answers for this contest');
    }

    // Create new participation
    const participation = await Participation.create({
      userId,
      contestId,
      status: 'in-progress',
      score: 0,
      startedAt: now
    }, { transaction: t });

    await t.commit();
    return {
      id: participation.id,
      contestId,
      status: participation.status,
      startedAt: participation.startedAt,
      questionCount: contest.questions.length
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Submit answers for a contest
 * @param {number} userId - User ID
 * @param {number} contestId - Contest ID
 * @param {Array} answers - User's answers
 * @returns {Promise<Object>} Participation results
 */
exports.submitAnswers = async (userId, contestId, answers) => {
  // Use transaction to ensure data consistency
  const t = await sequelize.transaction();

  try {
    // Get participation
    const participation = await Participation.findOne({
      where: {
        userId,
        contestId,
        status: 'in-progress'
      }
    });

    if (!participation) {
      throw new NotFoundError('Active participation not found');
    }

    // Get contest with questions and options
    const contest = await Contest.findByPk(contestId, {
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
        }
      ]
    });

    if (!contest) {
      throw new NotFoundError('Contest not found');
    }

    // Check if contest has ended
    const now = new Date();
    if (new Date(contest.endTime) < now) {
      throw new BadRequestError('Contest has already ended');
    }

    // Validate and store answers
    const questionIds = contest.questions.map(q => q.id);
    const questionMap = contest.questions.reduce((map, q) => {
      map[q.id] = q;
      return map;
    }, {});

    // Check for duplicate questionIds in user answers
    const answeredQuestionIds = answers.map(a => a.questionId);
    if (new Set(answeredQuestionIds).size !== answeredQuestionIds.length) {
      throw new BadRequestError('Duplicate question answers detected');
    }

    // Validate that answers are for valid questions
    for (const answer of answers) {
      if (!questionIds.includes(answer.questionId)) {
        throw new BadRequestError(`Question with id ${answer.questionId} not found in this contest`);
      }
      
      // Get the question for this answer
      const question = questionMap[answer.questionId];
      
      // Get all valid option IDs for this question
      const validOptionIds = question.options.map(o => o.id);
      
      // Check if all provided options are valid
      for (const optionId of answer.optionIds) {
        if (!validOptionIds.includes(optionId)) {
          throw new BadRequestError(`Option ${optionId} is not valid for question ${answer.questionId}`);
        }
      }
      
      // Validate based on question type
      if (question.type === 'single-select' || question.type === 'true-false') {
        // These types should have exactly one selected option
        if (answer.optionIds.length !== 1) {
          throw new BadRequestError(
            `Question ${answer.questionId} is ${question.type} type and requires exactly one option selection`
          );
        }
      }
      
      // For true-false, additional validation could be added if needed
      if (question.type === 'true-false' && answer.optionIds.length !== 1) {
        throw new BadRequestError(
          `True/False question ${answer.questionId} requires exactly one option selection`
        );
      }
    }
    
    // Check if all questions are answered
    if (answers.length !== contest.questions.length) {
      throw new BadRequestError('All questions must be answered');
    }

    // Calculate score
    let score = 0;
    const answersToCreate = [];
    const answerOptionsToCreate = [];

    for (const userAnswer of answers) {
      const question = questionMap[userAnswer.questionId];
      
      // Create answer record
      const answer = {
        participationId: participation.id,
        questionId: userAnswer.questionId,
        createdAt: now,
        updatedAt: now
      };
      
      answersToCreate.push(answer);

      // For tracking if the answer is correct
      let isAnswerCorrect = false;
      
      // Process based on question type
      if (question.type === 'single-select' || question.type === 'true-false') {
        // For single-select, only one optionId should be provided
        const selectedOptionId = userAnswer.optionIds[0];
        
        // Find the selected option
        const option = question.options.find(o => o.id === selectedOptionId);
        
        if (option && option.isCorrect) {
          isAnswerCorrect = true;
          score += 1;
        }
        
        // Save the selected option
        answerOptionsToCreate.push({
          answerId: null, // Will be updated after creating answers
          optionId: selectedOptionId,
          createdAt: now,
          updatedAt: now
        });
      } 
      else if (question.type === 'multi-select') {
        // For multi-select, track if all correct options are selected and no incorrect ones
        const correctOptionIds = question.options
          .filter(o => o.isCorrect)
          .map(o => o.id);
          
        const incorrectOptionIds = question.options
          .filter(o => !o.isCorrect)
          .map(o => o.id);
          
        // Check if all correct options are selected and no incorrect ones
        const allCorrectSelected = correctOptionIds.every(id => 
          userAnswer.optionIds.includes(id)
        );
        
        const noIncorrectSelected = !userAnswer.optionIds.some(id => 
          incorrectOptionIds.includes(id)
        );
        
        // Award a point only if all conditions are met
        if (allCorrectSelected && noIncorrectSelected) {
          isAnswerCorrect = true;
          score += 1;
        }
        
        // Save all selected options
        for (const optionId of userAnswer.optionIds) {
          answerOptionsToCreate.push({
            answerId: null, // Will be updated after creating answers
            optionId,
            createdAt: now,
            updatedAt: now
          });
        }
      }
    }

    // Bulk create answers
    const createdAnswers = await Answer.bulkCreate(answersToCreate, { transaction: t });

    // Update answer options with answerId
    for (let i = 0; i < answers.length; i++) {
      const answer = createdAnswers[i];
      const userAnswer = answers[i];
      
      // Find options for this answer and update with answerId
      userAnswer.optionIds.forEach(optionId => {
        const option = answerOptionsToCreate.find(o => o.optionId === optionId);
        if (option) {
          option.answerId = answer.id;
        }
      });
    }

    // Bulk create answer options
    await AnswerOption.bulkCreate(answerOptionsToCreate, { transaction: t });

    // Update participation
    await participation.update({
      status: 'submitted',
      score,
      submittedAt: now
    }, { transaction: t });

    await t.commit();
    
    // Invalidate leaderboard cache after successful submission
    invalidateLeaderboardCache(contestId);
    
    // Invalidate user history cache
    invalidateUserHistoryCache(userId);
    
    return {
      id: participation.id,
      contestId,
      status: 'submitted',
      score,
      totalQuestions: contest.questions.length,
      startedAt: participation.startedAt,
      submittedAt: now
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};