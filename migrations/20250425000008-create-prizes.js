'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Prizes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      contestId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Contests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true, // Changed to allow null values initially
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      rank: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      prizeDetails: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      awarded: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      awardedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      claimed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      claimedAt: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Add unique constraints
    await queryInterface.addConstraint('Prizes', {
      fields: ['contestId', 'rank'],
      type: 'unique',
      name: 'unique_contest_rank'
    });

    // Regular index for contestId and userId without unique constraint,
    // as userId can be null initially and multiple prizes can have null userId
    await queryInterface.addIndex('Prizes', {
      fields: ['contestId', 'userId'],
      name: 'idx_contest_user_prize'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Prizes');
  }
};