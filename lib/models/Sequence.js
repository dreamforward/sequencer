'use strict'

module.exports = (sequelize, DataTypes) => {
  const Sequence = sequelize.define('Sequence', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    tableName: 'sequences'
  })
  Sequence.associate = (models) => {
    Sequence.hasMany(models.Step, {foreignKey: 'sequenceId'})
  }
  return Sequence
}