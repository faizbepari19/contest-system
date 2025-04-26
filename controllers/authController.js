const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Register a new user
 * @route POST /api/auth/signup
 * @access Public
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user with email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Check if username is taken
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({
        status: 'error',
        message: 'Username is already taken'
      });
    }

    // Create user with provided role or default to 'normal'
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'normal'
    });

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign({ 
    id: user.id,
    role: user.role 
  }, 
  process.env.JWT_SECRET, 
  { 
    expiresIn: process.env.JWT_EXPIRE || '24h' 
  });
};