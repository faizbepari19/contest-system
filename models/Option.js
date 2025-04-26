module.exports = (sequelize, DataTypes) => {
  const Option = sequelize.define('Option', {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'id'
      }
    }
  });

  Option.associate = function(models) {
    Option.belongsTo(models.Question, { foreignKey: 'questionId', as: 'question' });
  };

  return Option;
};