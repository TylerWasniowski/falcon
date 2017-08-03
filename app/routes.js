// @flow
import React from 'react';
import { Switch, Route } from 'react-router';
import { Row, Alert } from 'antd';
import { HashRouter as Router } from 'react-router-dom';
import Loadable from 'react-loadable';
import App from './containers/App';

const LoadableHelper = (module, opts = {}) =>
  Loadable({
    loader: () => module,
    loading: () => <div>Loading...</div>,
    delay: 2000,
    ...opts
  });

const HomePage = LoadableHelper(import('./containers/HomePage'));
const LoginPage = LoadableHelper(import('./containers/LoginPage'));

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
          <Route path="/home/:databasePath" component={HomePage} />
          <Route path="/" component={LoginPage} history={history} />
        </Switch>
      </Row>
    </App>
  </Router>);

HomePage.preload();
