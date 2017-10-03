// @flow
import React, { Component } from 'react';
import { Input, Col, Row, Select, Button, Icon, message } from 'antd';
import { remote, ipcRenderer } from 'electron';
import type { ContextRouter } from 'react-router-dom';
import Connections from '../api/Connections';
import SavedDatabases from '../components/SavedDatabases';
import type { LoginSavedDatabaseType } from '../types/LoginSavedDatabaseType';
import { OPEN_FILE_CHANNEL } from '../types/channels';
import img from '../../resources/falcon.png';

const InputGroup = Input.Group;
const Option = Select.Option;
const logoStyle = {
  margin: '0 auto',
  display: 'block'
};
const { dialog } = remote;

const error = (label) => {
  message.error(label);
};

type Props = {
  ...ContextRouter
};

type State = {
  databaseNickname: string,
  databasePath: string,
  savedDatabases: Array<LoginSavedDatabaseType>
};

export default class LoginPage extends Component<Props, State> {
  connections = new Connections();

  constructor(props: Props) {
    super(props);
    this.state = {
      databaseNickname: '',
      databasePath: '',
      savedDatabases: this.connections.getSavedDatabases() || []
    };
    ipcRenderer.on(OPEN_FILE_CHANNEL, (event, filePath) => {
      this.setState({ databasePath: filePath });
      this.handleConnect();
    });
  }

  handleDatabasePathSelection = () => {
    const selectedFiles = dialog.showOpenDialog({
      filters: [{ name: 'SQLite', extensions: ['sqlite', 'db', 'sqlite3'] }],
      title: 'Set a database'
    });
    if (!selectedFiles) return;
    const databasePath = selectedFiles[0];
    this.setState({ databasePath });
  };

  handleSaveDatabase = async () => {
    try {
      this.setState({
        savedDatabases: await this.connections.saveDatabase(
          this.state.databaseNickname,
          this.state.databasePath
        )
      });
    } catch (e) {
      error(e);
    }
  };

  handleConnect = async (e?: SyntheticEvent<>) => {
    if (e) {
      e.preventDefault();
    }
    if (
      (await Connections.validateDatabaseFilePath(this.state.databasePath)) !==
      true
    ) {
      const errorMesage =
        this.state.databasePath === ''
          ? 'Database path is empty'
          : `${this.state.databasePath} isn't a valid sqlite file path`;
      error(errorMesage);
      return;
    }

    const flag = await Connections.validateConnection(this.state.databasePath);
    if (flag !== true) {
      error(flag);
      return;
    }

    const path = `/home/${this.state.databasePath.replace(/\//g, '_')}`;
    this.props.history.push(path);
  };

  loadSavedDatabase = (databasePath: string, databaseNickname: string) => {
    this.setState({ databasePath, databaseNickname });
  };

  deleteSavedDatabase = (savedDatabase: LoginSavedDatabaseType) => {
    const savedDatabases = this.connections.deleteSavedDatabase(savedDatabase);
    this.setState({ savedDatabases });
  };

  render() {
    const { databasePath } = this.state;
    const suffix =
      databasePath.substring(databasePath.lastIndexOf('.') + 1) === 'sqlite' ||
      databasePath.substring(databasePath.lastIndexOf('.') + 1) === 'db' ||
      databasePath.substring(databasePath.lastIndexOf('.') + 1) === 'sqlite3'
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
