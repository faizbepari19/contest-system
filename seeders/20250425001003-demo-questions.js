module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Get the contest IDs
      const contests = await queryInterface.sequelize.query(
        `SELECT id, name FROM Contests;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      const generalKnowledgeContest = contests.find(contest => contest.name === 'General Knowledge Quiz');
      const vipScienceContest = contests.find(contest => contest.name === 'VIP Science Challenge');
      const historyContest = contests.find(contest => contest.name === 'History Trivia Contest');
      
      // Default contest IDs if contests not found
      const gkId = generalKnowledgeContest?.id || 1;
      const vipId = vipScienceContest?.id || 2;
      const histId = historyContest?.id || 3;
      
      if (!generalKnowledgeContest || !vipScienceContest || !historyContest) {
        console.warn('Some contests not found, using default IDs');
      }
      
      // Create questions for each contest
      const questions = [
        // General Knowledge Quiz Questions
        {
          text: 'What is the capital of France?',
          type: 'single-select',
          contestId: gkId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Which of the following are primary colors?',
          type: 'multi-select',
          contestId: gkId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'The Earth is flat.',
          type: 'true-false',
          contestId: gkId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        
        // VIP Science Challenge Questions
        {
          text: 'Which of the following is NOT a noble gas?',
          type: 'single-select',
          contestId: vipId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Select all items that are parts of a cell:',
          type: 'multi-select',
          contestId: vipId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Einstein\'s theory of general relativity explains the force of gravity.',
          type: 'true-false',
          contestId: vipId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        
        // History Trivia Contest Questions
        {
          text: 'Who was the first president of the United States?',
          type: 'single-select',
          contestId: histId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Which of these events occurred during World War II?',
          type: 'multi-select',
          contestId: histId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'The Roman Empire fell in 476 AD.',
          type: 'true-false',
          contestId: histId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      return await queryInterface.bulkInsert('Questions', questions);
    } catch (error) {
      console.error('Error seeding questions:', error);
      console.log('Application will continue starting despite seeder failure');
      // Return resolved promise to allow app to continue
      return Promise.resolve();
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      return await queryInterface.bulkDelete('Questions', null, {});
    } catch (error) {
      console.error('Error removing question seeds:', error);
      console.log('Application will continue starting despite seeder failure');
      // Return resolved promise to allow app to continue
      return Promise.resolve();
    }
  }
};