'use strict'
const wrapPromise = require('../../lib/wrapPromise')

const modelMapping = {
  'runners': 'Runner',
  'sequences': 'Sequence',
  'steps': 'Step'
}

const create = (event) => {
  const models = require('../../models/index')
  return models[modelMapping[event.pathParameters.model]].create(JSON.parse(event.body))
}
const retrieve = (event) => {
  const filter = {}
  const models = require('../../models/index')
  if (event.pathParameters.id) {
    filter.id = parseInt(event.pathParameters.id)
  }
  return models[modelMapping[event.pathParameters.model]].findAll({where: filter, order: ['id']})
}

const update = (event) => {
  const models = require('../../models/index')
  const id = parseInt(event.pathParameters.id, 10)
  return models[modelMapping[event.pathParameters.model]].findById(id)
    .then((foundModel) => {
      foundModel.set(JSON.parse(event.body))
      return foundModel.save()
    })
}

const remove = (event) => {
  const models = require('../../models/index')
  const id = parseInt(event.pathParameters.id, 10)
  return models[modelMapping[event.pathParameters.model]].findById(id)
    .then(model => model.destroy())
}

module.exports = {
  retrieve: wrapPromise.rest(retrieve),
  update: wrapPromise.rest(update),
  create: wrapPromise.rest(create),
  remove: wrapPromise.rest(remove)
}
