'use strict'

const Promise = require('bluebird')
const AWS = require('aws-sdk')

AWS.config.setPromisesDependency(Promise)

const lambda = new AWS.Lambda({
  region: 'us-west-2'
})

module.exports = (runnerList) => {
  if (process.env.IS_OFFLINE) {
    console.log('OFFLINE - Manually calling fetch external data')
    const lambda = require('../functions/api/fetchExternalData')
    return new Promise((resolve, reject) => {
      return lambda.run(runnerList, {
        succeed: resolve,
        fail: reject
      })
    })
  }
  return lambda.invoke({
    FunctionName: process.env.FETCH_EXTERNAL_DATA_LAMBDA,
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({
      runners: runnerList.map((runner) => {
        return runner.get({id: true, dataLookup: true})
      })
    })
  })
    .promise()
    .then((results) => {
      return JSON.parse(results.Payload)
    })
}
