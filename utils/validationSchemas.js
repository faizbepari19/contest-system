const Joi = require('joi');

// User and authentication schemas
const authSchemas = {
  // Registration schema
  register: {
    body: Joi.object({
      username: Joi.string().min(3).max(30).required()
        .messages({
          'string.min': 'Username must be at least 3 characters long',
          'string.max': 'Username cannot be more than 30 characters long',
          'any.required': 'Username is required'
        }),
      email: Joi.string().email().required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      password: Joi.string().min(6).required()
        .messages({
          'string.min': 'Password must be at least 6 characters long',
          'any.required': 'Password is required'
        }),
      role: Joi.string().valid('admin', 'vip', 'normal', 'guest')
        .messages({
          'any.only': 'Role must be one of: admin, vip, normal, guest'
        })
    })
  },

  // Login schema
  login: {
    body: Joi.object({
      email: Joi.string().email().required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      password: Joi.string().required()
        .messages({
          'any.required': 'Password is required'
        })
    })
  }
};

// User related schemas
const userSchemas = {
  // Create user schema
  create: {
    body: Joi.object({
      username: Joi.string().min(3).max(30).required()
        .messages({
          'string.min': 'Username must be at least 3 characters long',
          'string.max': 'Username cannot be more than 30 characters long',
          'any.required': 'Username is required'
        }),
      email: Joi.string().email().required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      password: Joi.string().min(6).required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
        .messages({
          'string.min': 'Password must be at least 6 characters long',
          'any.required': 'Password is required',
          'string.pattern.base': 'Password must include at least one lowercase letter, one uppercase letter, one digit, and one special character'
        }),
      role: Joi.string().valid('admin', 'vip', 'normal', 'guest').default('normal')
        .messages({
          'any.only': 'Role must be one of: admin, vip, normal, guest'
        })
    })
  },

  // Update user schema
  update: {
    body: Joi.object({
      username: Joi.string().min(3).max(30)
        .messages({
          'string.min': 'Username must be at least 3 characters long',
          'string.max': 'Username cannot be more than 30 characters long'
        }),
      email: Joi.string().email()
        .messages({
          'string.email': 'Please provide a valid email address'
        }),
      password: Joi.string().min(6)
        .messages({
          'string.min': 'Password must be at least 6 characters long'
        }),
      role: Joi.string().valid('admin', 'vip', 'normal', 'guest')
        .messages({
          'any.only': 'Role must be one of: admin, vip, normal, guest'
        })
    })
  }
};

// Contest related schemas
const contestSchemas = {
  // Create contest schema
  create: {
    body: Joi.object({
      contest: Joi.object({
        name: Joi.string().min(3).max(100).trim().required()
          .messages({
            'string.min': 'Contest name must be at least 3 characters long',
            'string.max': 'Contest name cannot be more than 100 characters long',
            'any.required': 'Contest name is required'
          }),
        description: Joi.string().min(10).max(2000).trim().required()
          .messages({
            'string.min': 'Description must be at least 10 characters long',
            'string.max': 'Description cannot be more than 2000 characters long',
            'any.required': 'Description is required'
          }),
        startTime: Joi.date().iso().greater('now').required()
          .messages({
            'date.greater': 'Start time must be in the future',
            'any.required': 'Start time is required',
            'date.format': 'Start time must be in ISO format'
          }),
        endTime: Joi.date().iso().greater(Joi.ref('startTime')).required()
          .messages({
            'date.greater': 'End time must be after start time',
            'any.required': 'End time is required',
            'date.format': 'End time must be in ISO format'
          }),
        accessLevel: Joi.string().valid('normal', 'vip').default('normal')
          .messages({
            'any.only': 'Access level must be either normal or vip'
          }),
        prizeInformation: Joi.string().max(1000).allow('', null)
      }).required(),
      questions: Joi.array().items(
        Joi.object({
          text: Joi.string().min(5).max(500).trim().required()
            .messages({
              'string.min': 'Question text must be at least 5 characters long',
              'string.max': 'Question text cannot be more than 500 characters long',
              'any.required': 'Question text is required'
            }),
          type: Joi.string().valid('single-select', 'multi-select', 'true-false').required()
            .messages({
              'any.only': 'Question type must be single-select, multi-select, or true-false',
              'any.required': 'Question type is required'
            }),
          options: Joi.array().items(
            Joi.object({
              text: Joi.string().min(1).max(200).trim().required()
                .messages({
                  'string.min': 'Option text must not be empty',
                  'string.max': 'Option text cannot be more than 200 characters long',
                  'any.required': 'Option text is required'
                }),
              isCorrect: Joi.boolean().required()
                .messages({
                  'any.required': 'isCorrect flag is required'
                })
            })
          ).custom((value, helpers) => {
            // Get the parent which has the question type
            const questionType = helpers.state.ancestors[1].type;
            
            // Validate based on question type
            if (questionType === 'true-false' && value.length !== 2) {
              return helpers.error('array.length', { limit: 2 });
            }
            
            if (questionType === 'single-select' && value.length < 2) {
              return helpers.error('array.min', { limit: 2 });
            }
            
            if (questionType === 'multi-select' && value.length < 2) {
              return helpers.error('array.min', { limit: 2 });
            }
            
            // Check for correct answer validity
            const correctOptions = value.filter(option => option.isCorrect);
            
            if (questionType === 'true-false' || questionType === 'single-select') {
              // These types should have exactly one correct option
              if (correctOptions.length !== 1) {
                return helpers.error('array.exactlyOne');
              }
            } else if (questionType === 'multi-select') {
              // Multi-select should have at least one correct option
              if (correctOptions.length < 1) {
                return helpers.error('array.atLeastOne');
              }
            }
            
            return value;
          }).min(2).required()
            .messages({
              'array.min': 'Each question must have at least 2 options',
              'any.required': 'Options are required for each question',
              'array.length': 'True/False questions must have exactly 2 options',
              'array.exactlyOne': 'Single-select and True/False questions must have exactly one correct option',
              'array.atLeastOne': 'Multi-select questions must have at least one correct option'
            })
        })
      ).min(1).max(50).required()
        .messages({
          'array.min': 'At least one question is required',
          'array.max': 'A contest cannot have more than 50 questions',
          'any.required': 'Questions are required'
        })
    })
  },

  // Update contest schema
  update: {
    body: Joi.object({
      name: Joi.string().min(3).max(100).trim()
        .messages({
          'string.min': 'Contest name must be at least 3 characters long',
          'string.max': 'Contest name cannot be more than 100 characters long'
        }),
      description: Joi.string().min(10).max(2000).trim()
        .messages({
          'string.min': 'Description must be at least 10 characters long',
          'string.max': 'Description cannot be more than 2000 characters long'
        }),
      startTime: Joi.date().iso()
        .messages({
          'date.format': 'Start time must be in ISO format'
        }),
      endTime: Joi.date().iso().when('startTime', {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref('startTime')),
        otherwise: Joi.date().min('now')
      }).messages({
        'date.greater': 'End time must be after start time',
        'date.min': 'End time cannot be in the past',
        'date.format': 'End time must be in ISO format'
      }),
      accessLevel: Joi.string().valid('normal', 'vip')
        .messages({
          'any.only': 'Access level must be either normal or vip'
        }),
      prizeInformation: Joi.string().max(1000).allow('', null)
    }).min(1).messages({
      'object.min': 'At least one field must be provided for update'
    })
  },

  // Add question schema
  addQuestion: {
    body: Joi.object({
      text: Joi.string().min(5).max(500).trim().required()
        .messages({
          'string.min': 'Question text must be at least 5 characters long',
          'string.max': 'Question text cannot be more than 500 characters long',
          'any.required': 'Question text is required'
        }),
      type: Joi.string().valid('single-select', 'multi-select', 'true-false').required()
        .messages({
          'any.only': 'Question type must be single-select, multi-select, or true-false',
          'any.required': 'Question type is required'
        }),
      options: Joi.array().items(
        Joi.object({
          text: Joi.string().min(1).max(200).trim().required()
            .messages({
              'string.min': 'Option text must not be empty',
              'string.max': 'Option text cannot be more than 200 characters long',
              'any.required': 'Option text is required'
            }),
          isCorrect: Joi.boolean().required()
            .messages({
              'any.required': 'isCorrect flag is required'
            })
        })
      ).custom((value, helpers) => {
        // Get the parent which has the question type
        const questionType = helpers.state.ancestors[0].type;
        
        // Validate based on question type
        if (questionType === 'true-false' && value.length !== 2) {
          return helpers.error('array.length', { limit: 2 });
        }
        
        if ((questionType === 'single-select' || questionType === 'multi-select') && value.length < 2) {
          return helpers.error('array.min', { limit: 2 });
        }
        
        // Check for correct answer validity
        const correctOptions = value.filter(option => option.isCorrect);
        
        if (questionType === 'true-false' || questionType === 'single-select') {
          // These types should have exactly one correct option
          if (correctOptions.length !== 1) {
            return helpers.error('array.exactlyOne');
          }
        } else if (questionType === 'multi-select') {
          // Multi-select should have at least one correct option
          if (correctOptions.length < 1) {
            return helpers.error('array.atLeastOne');
          }
        }
        
        return value;
      }).min(2).required()
        .messages({
          'array.min': 'Each question must have at least 2 options',
          'any.required': 'Options are required for each question',
          'array.length': 'True/False questions must have exactly 2 options',
          'array.exactlyOne': 'Single-select and True/False questions must have exactly one correct option',
          'array.atLeastOne': 'Multi-select questions must have at least one correct option'
        })
    })
  }
};

// Participation related schemas
const participationSchemas = {
  // Submit answers schema
  submit: {
    body: Joi.object({
      answers: Joi.array().items(
        Joi.object({
          questionId: Joi.number().integer().positive().required()
            .messages({
              'number.base': 'Question ID must be a number',
              'any.required': 'Question ID is required'
            }),
          optionIds: Joi.array().items(
            Joi.number().integer().positive().required()
          ).min(1).required()
            .messages({
              'array.min': 'At least one option must be selected',
              'any.required': 'Selected option IDs are required'
            })
        })
      ).min(1).required()
        .messages({
          'array.min': 'At least one answer is required',
          'any.required': 'Answers are required'
        })
    })
  }
};

// Prize validation schemas
const prizeSchemas = {
  createPrize: {
    body: Joi.object({
      prizes: Joi.array().items(
        Joi.object({
          rank: Joi.number().integer().min(1).required()
            .messages({
              'number.base': 'Rank must be a number',
              'number.min': 'Rank must be at least 1',
              'any.required': 'Rank is required'
            }),
          prizeDetails: Joi.string().required()
            .messages({
              'string.base': 'Prize details must be a string',
              'any.required': 'Prize details are required'
            })
        })
      ).min(1).required()
        .messages({
          'array.min': 'At least one prize must be provided',
          'any.required': 'Prizes array is required'
        })
    })
  },
  
  update: {
    body: Joi.object({
      prizeDetails: Joi.string()
        .messages({
          'string.base': 'Prize details must be a string'
        }),
      awarded: Joi.boolean()
        .messages({
          'boolean.base': 'Awarded must be a boolean'
        })
    }).min(1)
      .messages({
        'object.min': 'At least one field must be provided for update'
      })
  }
};

module.exports = {
  authSchemas,
  userSchemas,
  contestSchemas,
  participationSchemas,
  prizeSchemas
};