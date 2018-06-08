'use strict'

const sequences = 'sequences'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(sequences, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: Sequelize.STRING,
      description: Sequelize.STRING,
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable(sequences)
  }
}
