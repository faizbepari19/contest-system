const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { contestSchemas } = require('../utils/validationSchemas');

// Public routes (view only)
router.get('/', contestController.getAllContests); // List all contests
router.get('/:id', contestController.getContestById); // Contest details

// Admin routes (contest management)
router.post('/', authenticate, authorize('admin'), validate(contestSchemas.create), contestController.createContest);
router.put('/:id', authenticate, authorize('admin'), validate(contestSchemas.update), contestController.updateContest);
router.delete('/:id', authenticate, authorize('admin'), contestController.deleteContest);

module.exports = router;