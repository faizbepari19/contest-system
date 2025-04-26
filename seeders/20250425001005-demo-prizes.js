module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const contests = await queryInterface.sequelize.query(
        'SELECT id FROM Contests;',
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      if (contests.length === 0) {
        console.log('No contests found. Skipping prize seeding.');
        return Promise.resolve();
      }

      const now = new Date();
      const prizes = [];
      
      // Create prizes for each contest
      contests.forEach(contest => {
        // Add prizes for the contest
        prizes.push({
          contestId: contest.id,
          userId: null, // Set to null initially, will be assigned when awarded
          rank: 1,
          prizeDetails: 'First Prize - $500 Amazon Gift Card',
          awarded: false,
          awardedAt: null,
          claimed: false,
          claimedAt: null,
          createdAt: now,
          updatedAt: now
        });
        
        prizes.push({
          contestId: contest.id,
          userId: null, // Set to null initially, will be assigned when awarded
          rank: 2,
          prizeDetails: 'Second Prize - $250 Amazon Gift Card',
          awarded: false,
          awardedAt: null,
          claimed: false,
          claimedAt: null,
          createdAt: now,
          updatedAt: now
        });
        
        prizes.push({
          contestId: contest.id,
          userId: null, // Set to null initially, will be assigned when awarded
          rank: 3,
          prizeDetails: 'Third Prize - $100 Amazon Gift Card',
          awarded: false,
          awardedAt: null,
          claimed: false,
          claimedAt: null,
          createdAt: now,
          updatedAt: now
        });
      });
      
      return await queryInterface.bulkInsert('Prizes', prizes, {});
    } catch (error) {
      console.error('Error seeding prizes:', error);
      console.log('Application will continue starting despite seeder failure');
      // Return resolved promise to allow app to continue
      return Promise.resolve();
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      return await queryInterface.bulkDelete('Prizes', null, {});
    } catch (error) {
      console.error('Error removing prize seeds:', error);
      console.log('Application will continue starting despite seeder failure');
      // Return resolved promise to allow app to continue
      return Promise.resolve();
    }
  }
};