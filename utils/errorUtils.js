/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for when a resource is not found
 */
class NotFoundError extends APIError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

/**
 * Error for unauthorized access
 */
class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

/**
 * Error for forbidden access
 */
class ForbiddenError extends APIError {
  constructor(message = 'Forbidden access') {
    super(message, 403);
  }
}

/**
 * Error for bad request
 */
class BadRequestError extends APIError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/**
 * Async handler to handle promise rejections in route handlers
 * Eliminates need for try/catch blocks in controllers
 * @param {Function} fn - Controller function
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  APIError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  asyncHandler
};