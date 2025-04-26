const express = require('express');
const router = express.Router();
const prizeController = require('../controllers/prizeController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { prizeSchemas } = require('../utils/validationSchemas');

// Admin routes for prize management
router.post('/contest/:contestId', authenticate, authorize('admin'), validate(prizeSchemas.create), prizeController.createContestPrizes);
router.post('/contest/:contestId/award', authenticate, authorize('admin'), prizeController.awardContestPrizes);

// Public endpoint to view contest prizes
router.get('/contest/:contestId', prizeController.getContestPrizes);

module.exports = router;