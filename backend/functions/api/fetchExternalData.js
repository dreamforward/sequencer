'use strict'
const wrapPromise = require('../../lib/wrapPromise')

module.exports.run = wrapPromise.plain((externalDataLookupIds) => {
  return externalDataLookupIds.map((id) => {
    return {
      id: id,
      name: `Runner ${id}`,
      email: `${id}@example.com`,
      phone: '+15551231234'
    }
  })
})
