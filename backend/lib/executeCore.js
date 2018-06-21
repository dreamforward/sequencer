'use strict'

const AWS = require('aws-sdk')
const Promise = require('bluebird')
AWS.config.setPromisesDependency(Promise)

const lambda = new AWS.Lambda({
  region: 'us-west-2'
})

module.exports = () => {
  if (process.env.IS_OFFLINE) {
    console.log('OFFLINE - Ignoring core execution')
    return Promise.resolve()
  }
  return lambda.invoke({
    FunctionName: process.env.LAMBDA_PREAMBLE + 'core',
    InvocationType: 'Event'
  })
    .promise()
}
