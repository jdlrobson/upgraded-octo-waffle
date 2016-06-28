import React, { Component } from 'react'
import IntermediateState from './components/IntermediateState';
var api = require( './../api.js' );

// Pages
export default React.createClass({
  getInitialState() {
    return {
      title: null,
      content: null
    };
  },
  // You want to load subscriptions not only when the component update but also when it gets mounted. 
  componentWillMount(){
    this.load();
  },
  componentWillReceiveProps(nextProps){
    this.load();
  },
  load() {
		var self = this;
    api.getPage( this.props.params.title, this.props.params.lang ).then( function ( data ) {
      self.setState(data);
    } );
  },
  render(){
    var url;
    if ( !this.state.title ) {
      return <IntermediateState></IntermediateState>
    } else {
      url = '//' + this.props.params.lang + '.m.wikipedia.org/wiki/' + this.state.title;
      return (
        <div>
          <h2 dangerouslySetInnerHTML={{ __html: this.state.title}}></h2>
          <a className="btn btn-default btn-sm" href={url}>View on Wikipedia</a>
          <div dangerouslySetInnerHTML={{ __html: this.state.content}}></div>
        </div>
      )
    }
  }
} );
