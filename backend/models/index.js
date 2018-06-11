'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

if (!process.env.POSTGRES_PASSWORD) {
  throw new Error('Models/index.js required before password has been populated.')
}

const sequelize = new Sequelize(process.env.POSTGRES_DATABASE, process.env.POSTGRES_USERNAME, process.env.POSTGRES_PASSWORD, {
  dialect: 'postgres',
  host: process.env.POSTGRES_URL,
  logging: process.env.IS_OFFLINE === 'true',
  port: process.env.POSTGRES_PORT
})

const db = {}

fs
  .readdirSync(__dirname)
  .filter((file) => (file.indexOf('.') !== 0) && (file !== 'index.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
