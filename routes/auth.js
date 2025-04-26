const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { authSchemas } = require('../utils/validationSchemas');

// Public routes
router.post('/signup', validate(authSchemas.register), authController.register);
router.post('/login', validate(authSchemas.login), authController.login);

module.exports = router;