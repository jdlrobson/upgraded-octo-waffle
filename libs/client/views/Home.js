import React, { Component } from 'react'
import IntermediateState from './components/IntermediateState';
import Topic from './components/Topic';

var api = require( './../api.js' );
// Pages
export default React.createClass({
  getInitialState() {
    return {
      topics: []
    };
  },
  // You want to load subscriptions not only when the component update but also when it gets mounted. 
  componentWillMount(){
    this.load();
  },
  load() {
    var self = this;
    api.getTrending( this.props.params.filter ).then( function ( data ) {
      var topics = data.map( function ( item ) {
        return React.createElement(Topic, item);
      } );
      self.setState({ topics: topics });
    } );
  },
  render(){
    // show intermediate state if still loading, otherwise show list
    var children = this.state.topics.length ?
        (<div className="list-simple-group">{this.state.topics}</div>) :
        <IntermediateState></IntermediateState>

    return (
      <div>
        <h2>Hot</h2>
        {children}
      </div>
    )
  }
})

