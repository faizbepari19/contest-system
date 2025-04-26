const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');

// All routes require authentication and admin privileges
router.use(authenticate);
router.use(authorize('admin'));

// Admin routes for user management - simplified to essential operations
router.get('/', userController.getAllUsers); // View all users
router.put('/:id/role', userController.updateUserRole); // Update user role (for promoting to VIP or admin)

module.exports = router;