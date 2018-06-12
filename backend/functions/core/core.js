'use strict'

const wrapPromise = require('../../lib/wrapPromise')
const Promise = require('bluebird')
const executeStep = require('../../lib/executeStep')
const executeCore = require('../../lib/executeCore')
const fetchExternalData = require('../../lib/fetchExternalData')

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
    .then((steps) => {
      steps = steps.map((step) => {
        step.Runners = step.Runners.map((runner) => {
          return runner.get({raw: true})
        })
        return step
      })

      let externalUserLookupIds = steps.reduce((externalIds, step) => {
        if (!step.get('requiresExternalData')) {
          return externalIds
        }
        step.Runners.forEach((runner) => {
          externalIds[runner.dataLookup] = externalIds[runner.dataLookup] || []
          externalIds[runner.dataLookup].push(runner)
        })
        return externalIds
      }, {})
      if (Object.keys(externalUserLookupIds).length) {
        return fetchExternalData(Object.keys(externalUserLookupIds))
          .then((externalData) => {
            externalData.forEach((externalData) => {
              externalUserLookupIds[externalData.id].forEach((runner) => {
                runner.external = externalData
              })
            })
            return steps
          })
      }
      return steps
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
            metrics.next += actions.next.length
            nextResults = models.Runner.update({startStep: new Date(), stepId: stepResults.step.nextStep}, { where: { id: actions.next } })
          } else {
            metrics.finished += actions.next.length
            nextResults = models.Runner.update({endSequence: new Date(), stepId: null, isActive: false}, { where: { id: actions.next } })
          }
        }
        let altNextResults = Promise.resolve()
        if (actions.altNext.length) {
          if (stepResults.step.altNext) {
            metrics.altNext += actions.altNext.length
            altNextResults = models.Runner.update({startStep: new Date(), stepId: stepResults.step.altNextStep}, { where: { id: actions.altNext } })
          } else {
            metrics.finished += actions.altNext.length
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
        return changeResults.next || changeResults.altNext
      })
      if (hasChangedAnything) {
        return executeCore()
          .return(changes)
      }
      return changes
    })
})
