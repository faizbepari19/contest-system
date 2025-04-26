module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('single-select', 'multi-select', 'true-false'),
      allowNull: false
    },
    contestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Contests',
        key: 'id'
      }
    }
  });

  Question.associate = function(models) {
    Question.belongsTo(models.Contest, { foreignKey: 'contestId', as: 'contest' });
    Question.hasMany(models.Option, { foreignKey: 'questionId', as: 'options' });
    Question.hasMany(models.Answer, { foreignKey: 'questionId', as: 'answers' });
  };

  return Question;
};