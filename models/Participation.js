module.exports = (sequelize, DataTypes) => {
  const Participation = sequelize.define('Participation', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    contestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Contests',
        key: 'id'
      }
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('in-progress', 'submitted'),
      allowNull: false,
      defaultValue: 'in-progress'
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['userId', 'contestId']
      }
    ]
  });

  Participation.associate = function(models) {
    Participation.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Participation.belongsTo(models.Contest, { foreignKey: 'contestId', as: 'contest' });
    Participation.hasMany(models.Answer, { foreignKey: 'participationId', as: 'answers' });
  };

  return Participation;
};