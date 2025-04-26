'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AnswerOptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      answerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Answers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      optionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Options',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique constraint on answerId and optionId
    await queryInterface.addConstraint('AnswerOptions', {
      fields: ['answerId', 'optionId'],
      type: 'unique',
      name: 'unique_answer_option'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AnswerOptions');
  }
};