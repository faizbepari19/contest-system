module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Get questions for each contest
      const questions = await queryInterface.sequelize.query(
        `SELECT id, text, type FROM Questions;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      // Helper to find a specific question by text
      const findQuestion = (text) => {
        const question = questions.find(q => q.text.includes(text));
        if (!question) {
          console.warn(`Question containing "${text}" not found, using fallback ID`);
          return { id: Math.floor(Math.random() * 9) + 1 }; // Fallback to a random ID between 1-9
        }
        return question;
      };
      
      // Create options for each question
      const options = [
        // Options for "What is the capital of France?"
        {
          text: 'Paris',
          isCorrect: true,
          questionId: findQuestion('capital of France').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'London',
          isCorrect: false,
          questionId: findQuestion('capital of France').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Berlin',
          isCorrect: false,
          questionId: findQuestion('capital of France').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Madrid',
          isCorrect: false,
          questionId: findQuestion('capital of France').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        
        // Options for "Which of the following are primary colors?"
        {
          text: 'Red',
          isCorrect: true,
          questionId: findQuestion('primary colors').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Blue',
          isCorrect: true,
          questionId: findQuestion('primary colors').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Green',
          isCorrect: false,
          questionId: findQuestion('primary colors').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Yellow',
          isCorrect: true,
          questionId: findQuestion('primary colors').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        
        // Options for "The Earth is flat."
        {
          text: 'True',
          isCorrect: false,
          questionId: findQuestion('Earth is flat').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'False',
          isCorrect: true,
          questionId: findQuestion('Earth is flat').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        
        // Options for "Which of the following is NOT a noble gas?"
        {
          text: 'Helium',
          isCorrect: false,
          questionId: findQuestion('NOT a noble gas').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Oxygen',
          isCorrect: true,
          questionId: findQuestion('NOT a noble gas').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Neon',
          isCorrect: false,
          questionId: findQuestion('NOT a noble gas').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Argon',
          isCorrect: false,
          questionId: findQuestion('NOT a noble gas').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        
        // Options for "Select all items that are parts of a cell:"
        {
          text: 'Mitochondria',
          isCorrect: true,
          questionId: findQuestion('parts of a cell').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Nucleus',
          isCorrect: true,
          questionId: findQuestion('parts of a cell').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Web Browser',
          isCorrect: false,
          questionId: findQuestion('parts of a cell').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Cell Membrane',
          isCorrect: true,
          questionId: findQuestion('parts of a cell').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        
        // Options for "Einstein's theory of general relativity explains the force of gravity."
        {
          text: 'True',
          isCorrect: true,
          questionId: findQuestion('Einstein').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'False',
          isCorrect: false,
          questionId: findQuestion('Einstein').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        
        // Options for "Who was the first president of the United States?"
        {
          text: 'George Washington',
          isCorrect: true,
          questionId: findQuestion('first president').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Thomas Jefferson',
          isCorrect: false,
          questionId: findQuestion('first president').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Abraham Lincoln',
          isCorrect: false,
          questionId: findQuestion('first president').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'John Adams',
          isCorrect: false,
          questionId: findQuestion('first president').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        
        // Options for "Which of these events occurred during World War II?"
        {
          text: 'D-Day Invasion',
          isCorrect: true,
          questionId: findQuestion('World War II').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'The Battle of Hastings',
          isCorrect: false,
          questionId: findQuestion('World War II').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Pearl Harbor Attack',
          isCorrect: true,
          questionId: findQuestion('World War II').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'Battle of Stalingrad',
          isCorrect: true,
          questionId: findQuestion('World War II').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        
        // Options for "The Roman Empire fell in 476 AD."
        {
          text: 'True',
          isCorrect: true,
          questionId: findQuestion('Roman Empire').id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          text: 'False',
          isCorrect: false,
          questionId: findQuestion('Roman Empire').id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      return await queryInterface.bulkInsert('Options', options);
    } catch (error) {
      console.error('Error seeding options:', error);
      console.log('Application will continue starting despite seeder failure');
      // Return resolved promise to allow app to continue
      return Promise.resolve();
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      return await queryInterface.bulkDelete('Options', null, {});
    } catch (error) {
      console.error('Error removing option seeds:', error);
      console.log('Application will continue starting despite seeder failure');
      // Return resolved promise to allow app to continue
      return Promise.resolve();
    }
  }
};