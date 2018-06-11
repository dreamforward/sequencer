'use strict'

const AWS = require('aws-sdk')

AWS.config.setPromisesDependency(Promise)

const lambda = new AWS.Lambda({
  region: 'us-west-2'
})

module.exports = (step) => {
  if (process.env.IS_OFFLINE) {
    console.log('OFFLINE')
    const runner = require(`../functions/runners/${step.type}`)
    return new Promise((success, fail) => {
      return runner.run({
        config: step.config,
        runners: step.Runners.map((runner) => {
          return runner.get({raw: true})
        })
      }, {
        succeed: success,
        fail: fail
      })
    })
  }
  const label = 'Executed Step: ' + step.type
  console.time(label)
  return lambda.invoke({
    FunctionName: process.env.LAMBDA_PREAMBLE + step.type,
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({
      config: step.config,
      runners: step.Runners.map((runner) => {
        return runner.get({raw: true})
      })
    })
  })
    .promise()
    .then((results) => {
      console.timeEnd(label)
      return JSON.parse(results.Payload)
    })
}
