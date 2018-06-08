'use strict'

;[
  'email',
  'waitForDate'
].forEach((runner) => {
  const method = require(`./${runner}`)
  module.exports[runner] = (event, context) => {
    method(event)
      .then((data) => {
        context.succeed(data)
      })
      .catch((err) => {
        context.fail(err)
      })
  }
})
