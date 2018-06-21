'use strict'

const wrapPromise = require('../../lib/wrapPromise')
const Promise = require('bluebird')
const executeStep = require('../../lib/executeStep')
const executeCore = require('../../lib/executeCore')
const fetchExternalData = require('../../lib/fetchExternalData')

const fetchGoalSteps = () => {
  const models = require('../../models/index')
  return models.Step.findAll({
    where: {
      type: 'Goal'
    },
    include: [
      {
        model: models.Sequence,
        as: 'Sequence',
        attributes: ['id'],
        include: [
          {
            model: models.Runner,
            where: {
              isActive: true
            }
          }
        ]
      }
    ]
  })
    .map((step) => {
      step.Runners = step.Sequence.Runners.map((runner) => {
        return runner.get({raw: true})
      })
      delete step.Sequence
      return step
    })
}

const fetchActiveSteps = () => {
  const models = require('../../models/index')
  return models.Step.findAll({
    where: {
      type: {
        [models.Sequelize.Op.$ne]: 'Goal'
      }
    },
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
      step.Runners = step.Runners.map((runner) => {
        return runner.get({raw: true})
      })
      return step
    })
}

const populateStepsWithExternalData = (steps) => {
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
      })
  }
  return Promise.resolve()
}

const executeSteps = (steps) => {
  return steps.map((step) => {
    return Promise.props({
      step: step,
      results: executeStep(step)
    })
  })
}

const processStepResults = (stepResults) => {
  const models = require('../../models/index')
  return Promise.map(stepResults, (stepResults) => {
    const actions = stepResults.results.reduce((actions, result) => {
      actions[result.action].push(result.id)
      return actions
    }, {next: [], altNext: [], noop: []})

    const metrics = {
      type: stepResults.step.type,
      next: [],
      altNext: [],
      noop: actions.noop,
      finished: []
    }
    let nextResults = Promise.resolve()
    if (actions.next.length) {
      if (stepResults.step.nextStep) {
        metrics.next = metrics.next.concat(actions.next)
        nextResults = models.Runner.update({startStep: new Date(), stepId: stepResults.step.nextStep}, { where: { id: actions.next } })
      } else {
        metrics.finished = metrics.finished.concat(actions.next)
        nextResults = models.Runner.update({endSequence: new Date(), stepId: null, isActive: false}, { where: { id: actions.next } })
      }
    }
    let altNextResults = Promise.resolve()
    if (actions.altNext.length) {
      if (stepResults.step.altNext) {
        metrics.altNext = metrics.altNext.concat(actions.altNext)
        altNextResults = models.Runner.update({startStep: new Date(), stepId: stepResults.step.altNextStep}, { where: { id: actions.altNext } })
      } else {
        metrics.finished = metrics.finished.concat(actions.altNext)
        altNextResults.push(models.Runner.update({endSequence: new Date(), stepId: null, isActive: false}, { where: { id: actions.next } }))
      }
    }

    return Promise.all([
      nextResults,
      altNextResults
    ])
      .return(metrics)
  })
}

module.exports.run = wrapPromise.rest(() => {
  let metrics = {
    next: 0,
    altNext: 0,
    noop: 0,
    finished: 0
  }
  return Promise.props({
    goalSteps: fetchGoalSteps(),
    activeSteps: fetchActiveSteps()
  })
    .then((stepGroups) => {
      const allSteps = [].concat(stepGroups.goalSteps, stepGroups.activeSteps)
      return populateStepsWithExternalData(allSteps)
        .return(stepGroups)
    })
    .then((stepGroups) => {
      // Execute goal steps
      return executeSteps(stepGroups.goalSteps)
        .then(processStepResults)
        .then((changes) => {
          // Add metrics
          metrics.next += changes.next.length
          metrics.altNext += changes.altNext.length
          metrics.noop += changes.noop.length
          metrics.finished += changes.finished.length

          // Remove changed items from active steps!
          const changed = [].concat(changes.next, changes.altNext, changes.finished)
          if (!changed.length) {
            // Nothing changed, just run active steps
            return stepGroups.activeSteps
          }

          // Filter out runners from active steps who ended up moving due to a goal
          return stepGroups.activeSteps
            .map((step) => {
              step.Runners = step.Runners.filter((runner) => {
                return changed.includes(runner.id)
              })
              return step
            })
            .filter((step) => {
              return step.Runners.length
            })
        })
    })
    .then((activeSteps) => {
      return executeSteps(activeSteps)
        .then(processStepResults)
        .then((changes) => {
          // Add metrics
          metrics.next += changes.next.length
          metrics.altNext += changes.altNext.length
          metrics.noop += changes.noop.length
          metrics.finished += changes.finished.length

          return metrics
        })
    })
    .then((metrics) => {
      // Should we re-execute? Only if there were changes that were non terminal
      if (metrics.next || metrics.altNext) {
        return executeCore()
      }
    })
    .return(metrics)
})
