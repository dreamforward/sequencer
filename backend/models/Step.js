'use strict'

module.exports = (sequelize, DataTypes) => {
  const Step = sequelize.define('Step', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sequenceId: DataTypes.INTEGER,
    nextStep: DataTypes.INTEGER,
    altNextStep: DataTypes.INTEGER,
    type: DataTypes.STRING,
    config: DataTypes.JSON,
    requiresExternalData: DataTypes.BOOLEAN
  }, {
    tableName: 'steps'
  })
  Step.associate = (models) => {
    Step.belongsTo(models.Sequence, {foreignKey: 'sequenceId'})
    Step.hasMany(models.Runner, {foreignKey: 'stepId'})
  }
  return Step
}
