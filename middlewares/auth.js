const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { UnauthorizedError, ForbiddenError } = require('../utils/errorUtils');

/**
 * Authentication middleware to verify JWT tokens
 * Attaches the user to the request object if authentication is successful
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication required');
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is expired
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTimestamp) {
      throw new UnauthorizedError('Token expired');
    }
    
    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    // JWT verification errors
    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    } else if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    }
    next(err);
  }
};

/**
 * Authorization middleware to verify user roles
 * @param {...String} roles - Allowed roles
 * @returns {Function} Middleware function
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by authenticate middleware)
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    
    // Check if user has the required role
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }
    
    next();
  };
};