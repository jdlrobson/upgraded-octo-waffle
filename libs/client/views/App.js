import React, { Component } from 'react'

// Main component
class App extends Component {
  componentDidMount(){
    document.body.className=''
  }
  render(){
    return (
      <div className="container">
        <div className="row">
          <ul className="nav nav-pills" role="tablist">
            <li role="presentation" className="active">
              <a href="/">Home</a>
            </li>
          </ul>
        </div>
        <div className="row">
          { this.props.children }
        </div>
      </div>
    )
  }
}
export default App
