'use strict'

const Promise = require('bluebird')

module.exports = (context) => {
  return Promise.resolve({
    action: 'next',
    data: 'foo'
  })
}
