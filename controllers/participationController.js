const { Participation, Contest } = require('../models');
const participationService = require('../services/participationService');

/**
 * Join a contest
 * @route POST /api/participations/contests/:contestId/join
 * @access Private
 */
exports.joinContest = async (req, res, next) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.id;
    
    const participation = await participationService.joinContest(userId, contestId);
    
    res.status(201).json({
      status: 'success',
      message: 'Contest joined successfully',
      data: participation
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Submit answers for a contest
 * @route POST /api/participations/contests/:contestId/submit
 * @access Private
 */
exports.submitAnswers = async (req, res, next) => {
  try {
    const { contestId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;
    
    // Validate answers format
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        status: 'error',
        message: 'Answers must be provided as an array'
      });
    }
    
    // Pre-validate answers structure before sending to service
    for (const answer of answers) {
      if (!answer.questionId || !Number.isInteger(answer.questionId) || answer.questionId <= 0) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid questionId in answer: ${JSON.stringify(answer)}`
        });
      }
      
      if (!answer.optionIds || !Array.isArray(answer.optionIds) || answer.optionIds.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: `Missing or invalid optionIds in answer for question ${answer.questionId}`
        });
      }
      
      // Validate each optionId is a positive integer
      for (const optionId of answer.optionIds) {
        if (!Number.isInteger(optionId) || optionId <= 0) {
          return res.status(400).json({
            status: 'error',
            message: `Invalid optionId ${optionId} in answer for question ${answer.questionId}`
          });
        }
      }
    }
    
    // Submit answers
    const result = await participationService.submitAnswers(userId, contestId, answers);
    
    res.status(200).json({
      status: 'success',
      message: 'Answers submitted successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user's score for a specific contest
 * @route GET /api/participations/contests/:contestId/score
 * @access Private
 */
exports.getUserContestScore = async (req, res, next) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.id;
    
    // Find the participation
    const participation = await Participation.findOne({
      where: { 
        userId,
        contestId
      },
      include: [
        {
          model: Contest,
          as: 'contest',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!participation) {
      return res.status(404).json({
        status: 'error',
        message: 'You have not participated in this contest'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        contestId: participation.contestId,
        contestName: participation.contest.name,
        score: participation.score,
        status: participation.status,
        submittedAt: participation.submittedAt
      }
    });
  } catch (err) {
    next(err);
  }
};