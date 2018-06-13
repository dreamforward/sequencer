'use strict'
const wrapPromise = require('../../lib/wrapPromise')
const moment = require('moment')

module.exports.run = wrapPromise.plain((event) => {
  const config = event.config
  return event.runners.map((runner) => {
    const isLongEnough = moment().subtract(config.unit, config.amount).isAfter(moment(runner.startStep))
    return {
      id: runner.id,
      action: isLongEnough ? 'next' : 'noop'
    }
  })
})
