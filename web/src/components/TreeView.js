import React, { Component } from 'react'
import SortableTree from 'react-sortable-tree'
import 'react-sortable-tree/style.css'
import * as API from '../lib/api'
import Promise from 'bluebird'

export default class TreeView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      isSaving: false,
      treeData: []
    }

    Promise.props({
      sequences: API.fetch('sequences'),
      steps: API.fetch('steps')
    })
      .then((data) => {
        const treeData = data.sequences.map((sequence) => {
          const sequenceTreeMapping = data.steps
            .filter((step) =>{
              return step.sequenceId === sequence.id
            })
            .reduce((obj, step) => {
              obj[step.id] = step
              return obj
            }, {})


          const getNodeTitle = (node) => {
            return <div onMouseOver={this.setupHover(node)} onMouseOut={this.leaveHover}>
              {node.id}: {node.type}
            </div>
          }

          const traverse = (node) => {
            if (node.processed) {
              return {
                title: 'Recursive Reference',
                node
              }
            }
            node.processed = true
            if (!node) { return }
            const children = []
            if (node.nextStep) {
              children.push(traverse(sequenceTreeMapping[node.nextStep]))
            }
            if (node.altNextStep) {
              children.push(traverse(sequenceTreeMapping[node.altNextStep]))
            }
            return {
              title: getNodeTitle(node),
              node,
              expanded: true,
              children: children
            }
          }

          const rootNode = traverse(sequenceTreeMapping[sequence.firstStep])

          const unmatched = Object.keys(sequenceTreeMapping).filter((nodeId) => {
            const node = sequenceTreeMapping[nodeId]
            return !node.processed
          })
            .map((nodeId) => {
              const node = sequenceTreeMapping[nodeId]
              return {
                title: getNodeTitle(node),
                node,
                expanded: true
              }
            })

          return {
            title: sequence.title,
            children: [ rootNode ].concat(unmatched),
            expanded: true,
            canDrag: false
          }
        })


        this.setState({
          loading: false,
          treeData
        })
      })
  }
  setupHover = (node) => {
    return () => {
      this.setState({
        activeNode: node
      })
    }
  }
  leaveHover = () => {
    this.setState({
      activeNode: null
    })
  }

  changeTreeData = (treeData) => {
    console.log(treeData)
    this.setState({ treeData })
  }

  save = () => {
    const processNode = (node) => {
      let processPromise = Promise.resolve()

      let newConfig = {
        nextStep: null,
        altNextStep: null
      }
      if (node.children.length >= 1) {
        newConfig.nextStep = node.children[0].node.id
      }
      if (node.children.length >= 2) {
        newConfig.altNextStep = node.children[1].node.id
      }
      if (node.node.nextStep !== newConfig.nextStep ||
        node.node.altNextStep !== newConfig.altNextStep
      ) {
        processPromise = API.patch(`steps/${node.node.id}`, newConfig)
      }

      return processPromise.then(() => {
        return Promise.map(node.children, processNode)
      })
    }

    this.setState({
      isSaving: true
    })
    Promise.map(this.state.treeData, (rootNode) => {
      return Promise.map(rootNode.children, (child) => {
        return processNode(child)
      })
    })
      .then(() => {
        this.setState({
          isSaving: false
        })
      })

  }

  render () {
    if (this.state.loading) {
      return <div>
        LOADING
      </div>
    }
    let activeNode
    if (this.state.activeNode) {
      activeNode = <pre className='hoverDetails'>
        {JSON.stringify(this.state.activeNode.config, 0, 2)}
      </pre>
    }
    console.log(this.state.treeData)
    return (
      <div>
        <div className="columns">
          <div className="column col-8" style={{height: 600}}>
            <SortableTree
              treeData={this.state.treeData}
              onChange={this.changeTreeData}
            />
          </div>
          <div className="column col-4">
            {activeNode}
            <div className={this.state.isSaving ? 'btn is-primary disabled loading' : 'btn is-primary'} onClick={this.save}>Save</div>
          </div>
        </div>
      </div>
    )
  }
}
