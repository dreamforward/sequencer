'use strict'

const Promise = require('bluebird')
const aws = require('aws-sdk')

module.exports = {
  sendMail: (config) => {
    const ses = new aws.SES({
      region: 'us-west-2'
    })
    const eParams = {
      Destination: {
        ToAddresses: config.to || [],
        BccAddresses: config.bcc || [],
        CcAddresses: config.cc || []
      },
      Message: {
        Body: {
          Text: {
            Data: config.text
          },
          Html: {
            Data: config.html
          }
        },
        Subject: {
          Data: config.subject
        }
      },
      Source: config.from
    }
    return Promise.resolve(
      ses.sendEmail(eParams).promise()
    )
  }
}
