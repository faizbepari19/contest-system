module.exports = (sequelize, DataTypes) => {
  const AnswerOption = sequelize.define('AnswerOption', {
    answerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Answers',
        key: 'id'
      }
    },
    optionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Options',
        key: 'id'
      }
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['answerId', 'optionId']
      }
    ]
  });

  return AnswerOption;
};