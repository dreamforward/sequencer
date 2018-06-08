'use strict'

module.exports.run = (event, context) => {
  console.log(event)
  context.succeed()
}
