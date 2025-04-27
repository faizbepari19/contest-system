module.exports = (sequelize, DataTypes) => {
  const AnswerOption = sequelize.define('AnswerOption', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
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