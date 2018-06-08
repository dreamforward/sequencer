'use strict'

const steps = 'steps'
const sequences = 'sequences'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(steps, {
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
      nextStep: {
        type: Sequelize.INTEGER,
        references: {
          model: steps,
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      altNextStep: {
        type: Sequelize.INTEGER,
        references: {
          model: steps,
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      type: Sequelize.STRING,
      config: Sequelize.JSON,
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
    return queryInterface.dropTable(steps)
  }
}
