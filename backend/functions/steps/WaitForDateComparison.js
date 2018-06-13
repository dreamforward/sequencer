'use strict'
const wrapPromise = require('../../lib/wrapPromise')
const moment = require('moment')

module.exports.run = wrapPromise.plain((event) => {
  const config = event.config
  return event.runners.map((runner) => {
    const matches = config.values.includes(moment().get(config.attribute))
    return {
      id: runner.id,
      action: matches ? 'next' : 'noop'
    }
  })
})
