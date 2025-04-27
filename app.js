const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contestRoutes = require('./routes/contests');
const participationRoutes = require('./routes/participations');
const leaderboardRoutes = require('./routes/leaderboard');
const prizeRoutes = require('./routes/prizes');

// Initialize Express app
const app = express();

// Apply security middleware
app.use(helmet());
app.use(cors());

// Use Morgan for logging in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parse JSON request bodies
app.use(express.json());

// Apply rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // default: 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // default: 100 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 1 minute'
});

// Apply rate limiter to all requests
app.use(limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/participations', participationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/prizes', prizeRoutes); // Mount at /api/prizes for consistency
// Removed notification routes

// Base route for API health check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Contest Participation System API is running'
  });
});

// 404 route for undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.originalUrl}`
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;