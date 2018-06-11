'use strict'
const wrapPromise = require('../wrapPromise')
const Promise = require('bluebird')

module.exports = wrapPromise((event) => {
  return Promise.resolve({
    action: 'next',
    data: 'foo'
  })
})
