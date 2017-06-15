// @flow
import React from 'react';
import { Switch, Route } from 'react-router';
import { Row, Alert } from 'antd';
import { HashRouter as Router } from 'react-router-dom';
import App from './containers/App';
import Home from './containers/Home';
import Login from './containers/Login';
import Query from './containers/Query';

export default () =>
  (<Router>
    <App>
      <Row span={24}>
        <Alert
          message="Falcon is in Beta"
          description="Want to contribute? Go to the GitHub repo!"
          type="warning"
          closable
          showIcon
        />
      </Row>
      <Row span={24}>
        <Switch>
          <Route path="/home/" component={Home} />
          <Route path="/" component={Login} history={history} />
        </Switch>
      </Row>
    </App>
  </Router>);
