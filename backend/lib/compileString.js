'use strict'

const Handlebars = require('handlebars')

module.exports = (source, context) => {
  console.log(source, context)
  return Handlebars.compile(source)(context)
}
