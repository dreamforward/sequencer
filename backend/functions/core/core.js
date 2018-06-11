'use strict'

const wrapPromise = require('../wrapPromise')

module.exports.run = wrapPromise((event) => {
  console.log(event)
  return Promise.resolve('Success')
})
