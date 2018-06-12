'use strict'

const slscrypt = require('slscrypt')
const Promise = require('bluebird')

module.exports.plain = (handler) => {
  return (event, context) => {
    return slscrypt.get(process.env.POSTGRES_PASSWORD_KEY)
      .then((password) => {
        process.env.POSTGRES_PASSWORD = password
        return Promise.method(handler)(event)
      })
      .then((results) => {
        context.succeed(results)
      })
      .catch((err) => {
        context.fail(err)
      })
  }
}

module.exports.rest = (handler) => {
  return (event, context) => {
    // Decrypt postgres password prior to requiring the file
    return slscrypt.get(process.env.POSTGRES_PASSWORD_KEY)
      .then((password) => {
        process.env.POSTGRES_PASSWORD = password
        return Promise.method(handler)(event)
      })
      .then((results) => {
        context.succeed({
          statusCode: 200,
          body: JSON.stringify(results)
        })
      })
      .catch((err) => {
        context.succeed({
          statusCode: 500,
          body: `The Lambda encountered an error :-(

message:
${err.message}

stack:
${err.stack}`
        })
      })
  }
}
