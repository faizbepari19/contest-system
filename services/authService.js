const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { NotFoundError, UnauthorizedError, BadRequestError } = require('../utils/errorUtils');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} User data and JWT token
 */
exports.register = async (userData) => {
  const { username, email, password, role } = userData;

  // Check if user with email already exists
  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) {
    throw new BadRequestError('User with this email already exists');
  }

  // Check if username is taken
  const existingUsername = await User.findOne({ where: { username } });
  if (existingUsername) {
    throw new BadRequestError('Username is already taken');
  }

  // Create new user (password hashing handled by model hooks)
  const user = await User.create({
    username,
    email,
    password,
    role: role || 'normal'
  });

  // Generate JWT token
  const token = generateToken(user);

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    token
  };
};

/**
 * Login a user
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object} User data and JWT token
 */
exports.login = async (email, password) => {
  // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken(user);

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    token
  };
};

/**
 * Generate JWT token for a user
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};