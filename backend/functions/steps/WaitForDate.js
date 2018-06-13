'use strict'
const wrapPromise = require('../../lib/wrapPromise')
const moment = require('moment')

module.exports.run = wrapPromise.plain((event) => {
  const config = event.config
  return event.runners.map((runner) => {
    const matches = moment(config.date).isSame(moment(), 'day')
    return {
      id: runner.id,
      action: matches ? 'next' : 'noop'
    }
  })
})
