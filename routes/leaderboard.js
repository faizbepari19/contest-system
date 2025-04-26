const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { authenticate } = require('../middlewares/auth');

// Public endpoint for contest leaderboards
router.get('/contests/:contestId', leaderboardController.getContestLeaderboard); // Contest leaderboard

// Protected endpoints for user-specific data (requires authentication)
router.get('/user/history', authenticate, leaderboardController.getUserContestHistory); // User contest history - required by product specs
router.get('/user/in-progress', authenticate, leaderboardController.getUserInProgressContests); // User in-progress contests - required by product specs
router.get('/user/prizes', authenticate, leaderboardController.getUserPrizes); // User prizes won - required by product specs

module.exports = router;