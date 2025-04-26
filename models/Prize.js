module.exports = (sequelize, DataTypes) => {
  const Prize = sequelize.define('Prize', {
    contestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Contests',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Changed to allow null values initially
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    prizeDetails: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    awarded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    awardedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    claimed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    claimedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['contestId', 'rank']
      },
      {
        fields: ['contestId', 'userId'] // Removed unique constraint from userId since it can be null initially
      }
    ]
  });

  Prize.associate = function(models) {
    Prize.belongsTo(models.Contest, { foreignKey: 'contestId', as: 'contest' });
    Prize.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Prize;
};