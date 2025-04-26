const express = require('express');
const router = express.Router();
const participationController = require('../controllers/participationController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { participationSchemas } = require('../utils/validationSchemas');

// All routes require authentication
router.use(authenticate);

// Core participation routes from product requirements
router.post('/contests/:contestId/join', participationController.joinContest); // Join a contest
router.post('/contests/:contestId/submit', validate(participationSchemas.submit), participationController.submitAnswers); // Submit answers
router.get('/contests/:contestId/score', participationController.getUserContestScore); // Get user's score for a contest

module.exports = router;