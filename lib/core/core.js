'use strict'

module.exports = (event, context) => {
  console.log(event)
  context.succeed()
}
