'use strict'
const wrapPromise = require('../../lib/wrapPromise')
const Promise = require('bluebird')

module.exports.run = wrapPromise.plain((event) => {
  const config = event.config
  console.log('Email:', config)
  return event.runners.map((runner) => {
    return {
      id: runner.id,
      action: 'noop'
    }
  })
})
