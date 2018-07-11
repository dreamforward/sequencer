'use strict'
const wrapPromise = require('../../lib/wrapPromise')
const _ = require('lodash')

module.exports.run = wrapPromise.plain((event) => {
  const config = event.config
  return event.runners.map((runner) => {
    let value
    if (config.value.type === 'raw') {
      value = config.value.value
    } else if (config.value.type === 'get') {
      console.log(runner, config.value.value)
      value = _.get(runner, config.value.value)
    }
    let compareTo
    if (config.compareTo.type === 'raw') {
      compareTo = config.compareTo.value
    } else if (config.compareTo.type === 'get') {
      compareTo = _.get(runner, config.compareTo.value)
    }
    console.log(config.lodashCommand, value, compareTo)
    const matches = _[config.lodashCommand](value, compareTo)
    console.log('Matches?', matches)
    return {
      id: runner.id,
      action: matches ? 'next' : 'noop'
    }
  })
})
