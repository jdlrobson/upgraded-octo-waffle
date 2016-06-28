// routes.js
import React, { Component } from 'react'
import { Route, IndexRoute, Link } from 'react-router'
import { App, Home, Page, NoMatch } from './renderer.js'

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Home}/>
    <Route path="hot/:filter" component={Home}/>
    <Route path="wiki/:title" component={Page}/>
    <Route path=":lang/wiki/:title" component={Page}/>
    <Route path="*" component={NoMatch}/>
  </Route>
)

