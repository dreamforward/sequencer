'use strict'

const wrapPromise = require('../../lib/wrapPromise')
const Promise = require('bluebird')
const executeStep = require('../../lib/executeStep')
const executeCore = require('../../lib/executeCore')

module.exports.run = wrapPromise.rest(() => {
  const models = require('../../models/index')
  return models.Step.findAll({
    where: {},
    include: [
      {
        model: models.Runner,
        where: {
          isActive: true
        }
      }
    ]
  })
    .map((step) => {
      return Promise.props({
        step: step,
        results: executeStep(step)
      })
    })
    .then((stepResults) => {
      return Promise.map(stepResults, (stepResults) => {
        const actions = stepResults.results.reduce((actions, result) => {
          actions[result.action].push(result.id)
          return actions
        }, {next: [], altNext: [], noop: []})

        const metrics = {
          type: stepResults.step.type,
          next: 0,
          altNext: 0,
          noop: actions.noop.length,
          finished: 0
        }
        let nextResults = Promise.resolve()
        if (actions.next.length) {
          if (stepResults.step.nextStep) {
            metrics.next += stepResults.step.nextStep
            nextResults = models.Runner.update({startStep: new Date(), stepId: stepResults.step.nextStep}, { where: { id: actions.next } })
          } else {
            metrics.finished += stepResults.step.nextStep
            nextResults = models.Runner.update({endSequence: new Date(), stepId: null, isActive: false}, { where: { id: actions.next } })
          }
        }
        let altNextResults = Promise.resolve()
        if (actions.altNext.length) {
          if (stepResults.step.altNext) {
            metrics.altNext += stepResults.step.altNextStep
            altNextResults = models.Runner.update({startStep: new Date(), stepId: stepResults.step.altNextStep}, { where: { id: actions.altNext } })
          } else {
            metrics.finished += stepResults.step.altNextStep
            altNextResults.push(models.Runner.update({endSequence: new Date(), stepId: null, isActive: false}, { where: { id: actions.next } }))
          }
        }

        return Promise.all([
          nextResults,
          altNextResults
        ]).return(metrics)
      })
    })
    .then((changes) => {
      // Everything is processed
      let hasChangedAnything = changes.find((changeResults) => {
        return changeResults.next.length || changeResults.altNext.length
      })
      if (hasChangedAnything) {
        return executeCore()
          .return(changes)
      }
      return changes
    })
})
