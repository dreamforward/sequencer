'use strict'

const Handlebars = require('handlebars')

module.exports = (source, context) => {
  return Handlebars.compile(source)(context)
}
