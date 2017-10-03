// @flow
import React, { Component } from 'react';
import { Layout, Menu, Icon, Spin, Button } from 'antd';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import type { ContextRouter } from 'react-router-dom';
import TableView from './TableView';
import BreadcrumbWrapper from '../components/BreadcrumbWrapper';
import QueryView from './QueryView';
import { getDatabases } from '../api/Database';
import type { DatabaseType } from '../types/DatabaseType';
import type { TableType } from '../types/TableType';
import { OPEN_FILE_CHANNEL, DELETE_TABLE_CHANNEL } from '../types/channels';

const { SubMenu } = Menu;
const { Content, Sider } = Layout;

type Props = {
  ...ContextRouter
};

type State = {
  databasePath: string,
  database: ?DatabaseType,
  tables: Array<TableType>,
  selectedTableName: ?string,
  showQuery: boolean,
  siderCollapsed: boolean
};

export default class HomePage extends Component<Props, State> {
  didMount: boolean = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      // @TODO: See LoginPage line 131 for why replace'_' with '/'
      databasePath: this.props.match.params.databasePath.replace(/_/g, '/'),
      database: null,
      tables: [],
      selectedTableName: null,
      showQuery: false,
      siderCollapsed: false
    };
    ipcRenderer.on(OPEN_FILE_CHANNEL, (event, filePath) => {
      this.setDatabaseResults(filePath);
    });
    ipcRenderer.on(DELETE_TABLE_CHANNEL, () => {
      this.deleteSelectedTable();
    });
  }

  // @TODO: Since supporting just SQLite, getDatabases will only return 1 db
  setDatabaseResults = async (filePath: string) => {
    const databasesArr = await getDatabases(filePath);
    const database = databasesArr[0];

    this.setState({
      database,
      selectedTableName:
        this.state.selectedTableName || database.tables[0].tableName,
      // @TODO: Use tableName instead of whole table object contents
      tables: _.cloneDeep(database.tables),
      databasePath: filePath
    });
  };

  getBreadcrumbRoute = (): Array<string> => {
    if (!this.state.database) {
      throw new Error("database shouldn't be null");
    }
    if (this.state.showQuery) {
      return ['SQLite', 'Query'];
    }
    if (!this.state.selectedTableName) {
      throw new Error('this.state.selectedTableName is falsey');
    }
    return [
      'SQLite',
      this.state.database.databaseName,
      this.state.selectedTableName
    ];
  };

  handleSelectedTableNameChange(subMenu: SubMenu, self: HomePage) {
    if (!self.didMount) {
      return;
    }

    this.setState({
      selectedTableName: subMenu.key,
      showQuery: subMenu.key === 'Query'
    });
  }

  // deleteSelectedTable removes selected from this.state.tables, but
  // does not remove it from database
  deleteSelectedTable = () => {
    const tables = _.cloneDeep(this.state.tables).filter(
      table => !_.isEqual(table.tableName, this.state.selectedTableName)
    );
    this.setState({ tables });
  };

  componentDidMount() {
    this.didMount = true;
    this.setDatabaseResults(this.state.databasePath);
  }

  componentWillUnmount() {
    this.didMount = false;
  }

  render() {
    const { database, selectedTableName, databasePath } = this.state;
    if (!(database && selectedTableName && databasePath)) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
        >
          <Spin size="large" />
        </div>
      );
    }
    return (
      <div id="HomeDiv">
        <Layout>
          <Content>
            <BreadcrumbWrapper routeItems={this.getBreadcrumbRoute()} />
            <Icon
              className="trigger"
              type={this.state.siderCollapsed ? 'menu-unfold' : 'menu-fold'}
              style={{ fontSize: '200%', color: '#08c', cursor: 'pointer' }}
              onClick={() =>
                this.setState({ siderCollapsed: !this.state.siderCollapsed })}
            />
            <Icon
              type="retweet"
              id="refreshIcon"
              style={{ fontSize: '200%', color: '#08c', cursor: 'pointer' }}
              onClick={() => this.setDatabaseResults(databasePath)}
            />
            <Link to={'/login}'}>
              <Button type="primary" loading={false}>
                Back to Login
              </Button>
            </Link>
            <Layout style={{ padding: '6px 0 0 0', background: '#fff' }}>
              <Sider
                style={{
                  background: '#fff',
                  // @TODO: height: 80vh is a hack for sidebar to fill space
                  overflow: 'auto',
                  height: '80vh'
                }}
                collapsible
                collapsedWidth={0}
                trigger={null}
                collapsed={this.state.siderCollapsed}
              >
                <Menu
                  mode="inline"
                  defaultSelectedKeys={[database.tables[0].tableName]}
                  defaultOpenKeys={[database.databaseName]}
                  style={{ height: '100%' }}
                  onSelect={e => this.handleSelectedTableNameChange(e, this)}
                >
                  <Menu.Item key="Query">
                    <Icon type="code" />
                    Query
                  </Menu.Item>
                  <SubMenu
                    key={database.databaseName}
                    title={
                      <span>
                        <Icon type="database" /> {database.databaseName}
                      </span>
                    }
                  >
                    {this.state.tables.map(table =>
                      (<Menu.Item key={table.tableName}>
                        <Icon type="bars" />
                        {table.tableName}
                      </Menu.Item>)
                    )}
                  </SubMenu>
                </Menu>
              </Sider>
              <Content
                style={{ padding: '0 24px', minHeight: 270, width: '50%' }}
              >
                {this.state.showQuery
                  ? <QueryView databasePath={databasePath} />
                  : <TableView
                    database={database}
                    databasePath={databasePath}
                    selectedTableName={selectedTableName}
                  />}
              </Content>
            </Layout>
          </Content>
        </Layout>
      </div>
    );
  }
}
