'use strict'
const wrapPromise = require('../../lib/wrapPromise')
const Promise = require('bluebird')
const compileString = require('../../lib/compileString')
const mail = require('../../lib/mail')

module.exports.run = wrapPromise.plain((event) => {
  const config = event.config
  return Promise.map(event.runners, (runner) => {
    const compiled = {
      from: compileString(config.from, runner),
      text: compileString(config.text, runner),
      html: compileString(config.html, runner),
      subject: compileString(config.subject, runner)
    }
    ;['to', 'bcc', 'cc'].forEach((key) => {
      if (typeof config[key] === 'string') {
        const emailString = compileString(config[key], runner)
        if (emailString.indexOf('[')) {
          compiled[key] = JSON.parse(emailString)
        } else {
          compiled[key] = [emailString]
        }
        return
      }
      compiled[key] = config[key].map((string) => {
        return compileString(string, runner)
      })
    })
    return mail.sendMail(compiled)
      .return({
        id: runner.id,
        action: 'next'
      })
  })
})
