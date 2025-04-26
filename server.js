require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync database in development mode (only for development)
    if (process.env.NODE_ENV === 'development' && process.env.DB_SYNC === 'true') {
      console.log('Syncing database models...');
      await sequelize.sync({ alter: true });
      // await sequelize.sync({ force: true })
      console.log('Database models synced successfully.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  
  // Close server & exit process
  process.exit(1);
});

// Handle SIGTERM signal (e.g., from Heroku)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  // Close server but don't exit immediately to allow pending requests to complete
  process.exit(0);
});

startServer();