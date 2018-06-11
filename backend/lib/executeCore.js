'use strict'

const AWS = require('aws-sdk')

AWS.config.setPromisesDependency(Promise)

const lambda = new AWS.Lambda({
  region: 'us-west-2'
})

module.exports = () => {
  return lambda.invoke({
    FunctionName: process.env.LAMBDA_PREAMBLE + 'core',
    InvocationType: 'Event'
  })
    .promise()
}
