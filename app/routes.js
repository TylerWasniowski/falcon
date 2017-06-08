// @flow
import React from 'react';
import { Switch, Route } from 'react-router';
import { HashRouter as Router } from 'react-router-dom';
import App from './containers/App';
import Home from './containers/Home';
import Login from './containers/Login';
import Query from './containers/Query';

export default () =>
  (<Router>
    <App>
      <Switch>
        <Route path="/home" component={Home} />
        <Route path="/query" component={Query} history={history} />
        <Route path="/" component={Login} history={history} />
      </Switch>
    </App>
  </Router>);
