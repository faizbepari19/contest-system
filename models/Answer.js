module.exports = (sequelize, DataTypes) => {
  const Answer = sequelize.define('Answer', {
    participationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Participations',
        key: 'id'
      }
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'id'
      }
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['participationId', 'questionId']
      }
    ]
  });

  Answer.associate = function(models) {
    Answer.belongsTo(models.Participation, { foreignKey: 'participationId', as: 'participation' });
    Answer.belongsTo(models.Question, { foreignKey: 'questionId', as: 'question' });
    Answer.belongsToMany(models.Option, { through: 'AnswerOptions', as: 'selectedOptions' });
  };

  return Answer;
};