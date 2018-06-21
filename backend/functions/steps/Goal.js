'use strict'
const wrapPromise = require('../../lib/wrapPromise')
const _ = require('lodash')

module.exports.run = wrapPromise.plain((event) => {
  const config = event.config
  return event.runners.map((runner) => {
    const value = _.get(runner, config.value)
    const compareTo = _.get(runner, config.compareTo)
    const matches = _[config.lodashCommand](value, compareTo)
    return {
      id: runner.id,
      action: matches ? 'next' : 'noop'
    }
  })
})
