'use strict'

const slscrypt = require('slscrypt')
const Promise = require('bluebird')

module.exports.plain = (handler) => {
  return (event) => {
    return slscrypt.get(process.env.POSTGRES_PASSWORD_KEY)
      .then((password) => {
        process.env.POSTGRES_PASSWORD = password
        return Promise.method(handler)(event)
      })
  }
}

module.exports.rest = (handler) => {
  return (event) => {
    // Decrypt postgres password prior to requiring the file
    return slscrypt.get(process.env.POSTGRES_PASSWORD_KEY)
      .then((password) => {
        process.env.POSTGRES_PASSWORD = password
        return Promise.method(handler)(event)
      })
      .then((results) => {
        return {
          statusCode: 200,
          body: JSON.stringify(results)
        }
      })
      .catch((err) => {
        return {
          statusCode: 500,
          body: `The Lambda encountered an error :-(

message:
${err.message}

stack:
${err.stack}`
        }
      })
  }
}
