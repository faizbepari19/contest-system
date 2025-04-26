const { BadRequestError } = require('../utils/errorUtils');

/**
 * Validate request data against a Joi schema
 * @param {Object} schema - Joi schema for validation
 * @returns {Function} Middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    if (!schema) {
      return next();
    }

    // Determine which part of the request to validate
    const validationTargets = {
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers
    };
    
    // Check if schema has validation for any part of the request
    for (const key in schema) {
      const target = validationTargets[key];
      const { error } = schema[key].validate(target, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: true
      });

      // If validation error found, return error response
      if (error) {
        const errorDetails = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
        
        return next(new BadRequestError(
          'Validation error: ' + errorDetails.map(ed => ed.message).join(', ')
        ));
      }
    }

    next();
  };
};

module.exports = validate;