const { APIError } = require('../utils/errorUtils');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error with request information for debugging
  console.error(`[Error] ${err.message}`);
  console.error(`Request: ${req.method} ${req.originalUrl}`);
  console.error(`User: ${req.user ? req.user.id : 'unauthenticated'}`);
  
  // Don't expose stack traces in production
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  
  // Handle custom API errors
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.code || 'API_ERROR'
    });
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors,
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Handle database connection errors
  if (err.name === 'SequelizeConnectionError' || 
      err.name === 'SequelizeConnectionRefusedError' ||
      err.name === 'SequelizeHostNotFoundError' ||
      err.name === 'SequelizeAccessDeniedError') {
    return res.status(503).json({
      status: 'error',
      message: 'Database connection error',
      code: 'DATABASE_ERROR'
    });
  }

  // Handle rate limit errors
  if (err.statusCode === 429) {
    return res.status(429).json({
      status: 'error',
      message: err.message || 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
  
  // Handle Sequelize timeout errors
  if (err.name === 'SequelizeTimeoutError') {
    return res.status(504).json({
      status: 'error',
      message: 'Request timeout',
      code: 'DATABASE_TIMEOUT'
    });
  }

  // Default to 500 server error for unexpected errors
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    code: 'INTERNAL_SERVER_ERROR'
  });
};

module.exports = errorHandler;