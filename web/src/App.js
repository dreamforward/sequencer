import React, { Component } from 'react'
import './App.css'
import TreeView from './components/TreeView'

class App extends Component {
  render () {
    return <div className='container'>
      <h1>Sequencer Admin</h1>
      <TreeView />
    </div>
  }
}

export default App
