'use strict'

const steps = 'steps'
const sequences = 'sequences'
const runners = 'runners'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(runners, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      sequenceId: {
        type: Sequelize.INTEGER,
        references: {
          model: sequences,
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      stepId: {
        type: Sequelize.INTEGER,
        references: {
          model: steps,
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      dataLookup: Sequelize.STRING,
      isActive: Sequelize.BOOLEAN,
      startSequence: Sequelize.DATE,
      endSequence: Sequelize.DATE,
      startStep: Sequelize.DATE,
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
    return queryInterface.dropTable(runners)
  }
}
