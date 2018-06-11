'use strict'

module.exports = (sequelize, DataTypes) => {
  const Runner = sequelize.define('Runner', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    dataLookup: DataTypes.STRING,
    sequenceId: DataTypes.INTEGER,
    stepId: DataTypes.INTEGER,
    isActive: DataTypes.BOOLEAN,
    startSequence: DataTypes.DATE,
    endSequence: DataTypes.DATE,
    startStep: DataTypes.DATE
  }, {
    tableName: 'runners'
  })
  Runner.associate = (models) => {
    Runner.hasMany(models.Step, {foreignKey: 'sequenceId'})
  }
  return Runner
}
