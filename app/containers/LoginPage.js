// @flow
import React, { Component } from 'react';
import _ from 'lodash';
import * as fs from 'fs';
import { Input, Col, Row, Select, Button, Icon, message } from 'antd';
import { remote } from 'electron';
import Store from 'electron-store';
import SavedDatabases from './SavedDatabases';
import type { LoginSavedDatabaseType } from '../types/LoginSavedDatabaseType';
import img from '../../resources/falcon.png';

const InputGroup = Input.Group;
const Option = Select.Option;
const logoStyle = {
  margin: '0 auto',
  display: 'block'
};
const { dialog } = remote;

function isDatabaseSaved(
  savedDatabases: Array<LoginSavedDatabaseType>,
  database: LoginSavedDatabaseType
) {
  return savedDatabases.some(e => _.isEqual(e, database));
}

const error = label => {
  message.error(label);
};

export default class LoginPage extends Component {
  state: {
    databaseNickname: string,
    databasePath: string,
    savedDatabases: Array<LoginSavedDatabaseType>
  };

  store = new Store();

  constructor(props: {}) {
    super(props);
    this.state = {
      databaseNickname: '',
      databasePath: '',
      savedDatabases: this.store.get('savedDatabases') || []
    };
  }

  handleDatabasePathSelection = () => {
    const selectedFiles = dialog.showOpenDialog({
      filters: [{ name: 'SQLite', extensions: ['sqlite', 'db'] }],
      title: 'Set a database'
    });
    if (!selectedFiles) return;
    const databasePath = selectedFiles[0];
    this.setState({ databasePath });
  };

  handleSaveDatabase = () => {
    const newDatabase = {
      nickname: this.state.databaseNickname,
      path: this.state.databasePath
    };
    if (this.validateSave(newDatabase)) {
      const savedDatabases = _.cloneDeep(this.state.savedDatabases);
      savedDatabases.push(newDatabase);
      this.store.set('savedDatabases', savedDatabases);
      this.setState({ savedDatabases });
    } else {
      error('Saved databases need a nickname and a valid database');
    }
  };

  handleConnect = (e: SyntheticEvent) => {
    e.preventDefault();
    if (this.validateConnect()) {
      const path = `/home/${this.state.databasePath.replace(/\//g, '_')}`;
      this.props.history.push(path);
    } else {
      error('Please choose a valid database');
    }
  };

  loadSavedDatabase = (databasePath: string, databaseNickname: string) => {
    this.setState({ databasePath, databaseNickname });
  };

  deleteSavedDatabase = (savedDatabase: LoginSavedDatabaseType) => {
    const savedDatabases = _.cloneDeep(this.state.savedDatabases).filter(e =>
      _.isEqual(e, savedDatabase)
    );
    this.store.set('savedDatabases', savedDatabases);
    this.setState({ savedDatabases });
  };

  validateConnect = () => {
    const { databasePath } = this.state;
    const fileExtension = databasePath.substring(databasePath.lastIndexOf('.'));
    return (
      fs.existsSync(databasePath) &&
      (fileExtension === '.db' || fileExtension === '.sqlite')
    );
  };

  validateSave = (database: LoginSavedDatabaseType) => {
    const { databaseNickname, savedDatabases } = this.state;
    return (
      this.validateConnect() &&
      databaseNickname !== '' &&
      isDatabaseSaved(savedDatabases, database)
    );
  };

  render() {
    const { databasePath } = this.state;
    const suffix =
      databasePath.substring(databasePath.lastIndexOf('.') + 1) === 'sqlite' ||
      databasePath.substring(databasePath.lastIndexOf('.') + 1) === 'db'
        ? (<Icon
          type="plus-circle-o"
          style={{ cursor: 'pointer' }}
          onClick={this.handleSaveDatabase}
        />)
        : null;
    return (
      <Col span={24}>
        <Row type="flex" justify="center">
          <Col span={8} />
          <Col span={8}>
            <img
              style={logoStyle}
              src={img}
              width="100rem"
              height="100rem"
              alt="Logo"
            />
          </Col>
          <Col span={8} />
        </Row>
        <Col span={8} />
        <Col span={8}>
          <br />
          <InputGroup size="large">
            <Input
              size="large"
              value={this.state.databaseNickname}
              onChange={e =>
                this.setState({ databaseNickname: e.target.value })}
              placeholder="connection name"
            />
            <Input
              placeholder="Add a database path"
              value={this.state.databasePath}
              onChange={e => this.setState({ databasePath: e.target.value })}
              prefix={
                <Icon
                  type="file-add"
                  style={{ cursor: 'pointer' }}
                  onClick={this.handleDatabasePathSelection}
                />
              }
              suffix={suffix}
            />
          </InputGroup>
          <br />
          <InputGroup compact>
            <Select size="large" defaultValue="sqlite">
              <Option value="sqlite">sqlite</Option>
            </Select>
          </InputGroup>
          <br />
          {/* @TODO: routing messes up when '/' is present. Need to replace */}
          <Button
            id="connectButton"
            type="primary"
            onClick={this.handleConnect}
            loading={false}
            size="large"
          >
            Connect
          </Button>
          <SavedDatabases
            savedDatabases={this.state.savedDatabases}
            loadSavedDatabase={this.loadSavedDatabase}
            deleteSavedDatabase={this.deleteSavedDatabase}
          />
        </Col>
        <Col span={8} />
      </Col>
    );
  }
}
