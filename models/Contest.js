module.exports = (sequelize, DataTypes) => {
  const Contest = sequelize.define('Contest', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfterStart(value) {
          if (new Date(value) <= new Date(this.startTime)) {
            throw new Error('End time must be after start time');
          }
        }
      }
    },
    accessLevel: {
      type: DataTypes.ENUM('normal', 'vip'),
      allowNull: false,
      defaultValue: 'normal'
    },
    prizeInformation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.VIRTUAL,
      get() {
        const now = new Date();
        const startTime = new Date(this.startTime);
        const endTime = new Date(this.endTime);
        
        if (now < startTime) {
          return 'upcoming';
        } else if (now >= startTime && now <= endTime) {
          return 'ongoing';
        } else {
          return 'ended';
        }
      }
    }
  });

  Contest.associate = function(models) {
    Contest.belongsTo(models.User, { foreignKey: 'creatorId', as: 'creator' });
    Contest.hasMany(models.Question, { foreignKey: 'contestId', as: 'questions' });
    Contest.hasMany(models.Participation, { foreignKey: 'contestId', as: 'participations' });
    Contest.hasMany(models.Prize, { foreignKey: 'contestId', as: 'prizes' });
  };

  return Contest;
};