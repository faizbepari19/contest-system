module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Get the admin user id as creator for the contests
      const adminUser = await queryInterface.sequelize.query(
        `SELECT id FROM Users WHERE username = 'admin' LIMIT 1;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      const adminId = adminUser[0]?.id;
      
      if (!adminId) {
        console.error('Admin user not found, using default ID 1');
      }

      // Create demo contests
      return await queryInterface.bulkInsert('Contests', [
        {
          name: 'General Knowledge Quiz',
          description: 'Test your knowledge with this general quiz covering various topics.',
          startTime: new Date(Date.now() + 3600000), // Starts in 1 hour
          endTime: new Date(Date.now() + 86400000), // Ends in 24 hours
          accessLevel: 'normal',
          prizeInformation: 'First place: $100 gift card\nSecond place: $50 gift card\nThird place: $25 gift card',
          creatorId: adminId || 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'VIP Science Challenge',
          description: 'A challenging science quiz for our VIP members with harder questions and bigger prizes!',
          startTime: new Date(Date.now() + 7200000), // Starts in 2 hours
          endTime: new Date(Date.now() + 172800000), // Ends in 48 hours
          accessLevel: 'vip',
          prizeInformation: 'First place: $200 gift card\nSecond place: $100 gift card\nThird place: $50 gift card',
          creatorId: adminId || 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'History Trivia Contest',
          description: 'Test your knowledge of world history events and famous historical figures.',
          startTime: new Date(Date.now() - 86400000), // Started 24 hours ago
          endTime: new Date(Date.now() + 86400000), // Ends in 24 hours
          accessLevel: 'normal',
          prizeInformation: 'First place: History books collection\nSecond place: Museum tickets\nThird place: History magazine subscription',
          creatorId: adminId || 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error seeding contests:', error);
      console.log('Application will continue starting despite seeder failure');
      // Return resolved promise to allow app to continue
      return Promise.resolve();
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      return await queryInterface.bulkDelete('Contests', null, {});
    } catch (error) {
      console.error('Error removing contest seeds:', error);
      console.log('Application will continue starting despite seeder failure');
      // Return resolved promise to allow app to continue
      return Promise.resolve();
    }
  }
};