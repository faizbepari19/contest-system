const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Create a salt
      const salt = await bcrypt.genSalt(10);
      
      // Hash passwords for demo users
      const adminPassword = await bcrypt.hash('admin123', salt);
      const vipPassword = await bcrypt.hash('vip123', salt);
      const normalPassword = await bcrypt.hash('user123', salt);

      // Get current timestamp for consistent dates
      const now = new Date();
      
      // Create demo users
      return await queryInterface.bulkInsert('Users', [
        {
          username: 'admin',
          email: 'admin@example.com',
          password: adminPassword,
          role: 'admin',
          createdAt: now,
          updatedAt: now
        },
        {
          username: 'vipuser',
          email: 'vip@example.com',
          password: vipPassword,
          role: 'vip',
          createdAt: now,
          updatedAt: now
        },
        {
          username: 'normaluser',
          email: 'user@example.com',
          password: normalPassword,
          role: 'normal',
          createdAt: now,
          updatedAt: now
        }
      ]);
    } catch (error) {
      console.error('Error seeding users:', error);
      console.log('Application will continue starting despite seeder failure');
      // Return resolved promise to allow app to continue
      return Promise.resolve();
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      return await queryInterface.bulkDelete('Users', null, {});
    } catch (error) {
      console.error('Error removing user seeds:', error);
      console.log('Application will continue starting despite seeder failure');
      // Return resolved promise to allow app to continue
      return Promise.resolve();
    }
  }
};