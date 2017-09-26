// @flow
import React, { Component } from 'react';
import { Layout, Menu, Icon, Spin, Button } from 'antd';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import type { ContextRouter } from 'react-router-dom';
import TableView from './TableView';
import BreadcrumbWrapper from '../components/BreadcrumbWrapper';
import Query from './Query';
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
  databases: Array<DatabaseType>,
  tables: Array<TableType>,
  selectedTableName: ?string,
  showQuery: boolean,
  siderCollapsed: boolean
};

/* @TODO: Home/Falcon's can only deal with one database at a time
        because of this.state.databasePath and databases[0]
*/
export default class HomePage extends Component<Props, State> {
  state: State;
  didMount: boolean = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      // @TODO: See LoginPage line 131 for why replace'_' with '/'
      databasePath: this.props.match.params.databasePath.replace(/_/g, '/'),
      databases: [],
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
    const databases = await getDatabases(filePath);
    this.setState({
      databases,
      selectedTableName:
        this.state.selectedTableName || databases[0].tables[0].tableName,
      tables: _.cloneDeep(databases[0].tables),
      databasePath: filePath
    });
  };

  getBreadcrumbRoute = (): Array<string> => {
    if (!this.state.databases[0]) {
      throw new Error('database should be null');
    }
    if (this.state.showQuery) {
      return ['SQLite', 'Query'];
    }
    if (!this.state.selectedTableName) {
      throw new Error('this.state.selectedTableName is falsey');
    }
    return [
      'SQLite',
      this.state.databases[0].databaseName,
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
    const { databases } = this.state;
    if (
      !(databases && this.state.selectedTableName && this.state.databasePath)
    ) {
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
              onClick={() => this.setDatabaseResults(this.state.databasePath)}
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
                  defaultSelectedKeys={[databases[0].tables[0].tableName]}
                  defaultOpenKeys={[databases[0].databaseName]}
                  style={{ height: '100%' }}
                  onSelect={e => this.handleSelectedTableNameChange(e, this)}
                >
                  <Menu.Item key="Query">
                    <Icon type="code" />
                    Query
                  </Menu.Item>
                  {databases.map(database =>
                    (<SubMenu
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
                    </SubMenu>)
                  )}
                </Menu>
              </Sider>
              <Content
                style={{ padding: '0 24px', minHeight: 270, width: '50%' }}
              >
                {this.state.showQuery
                  ? <Query databasePath={this.state.databasePath} />
                  : <TableView
                    databases={databases}
                    databasePath={this.state.databasePath}
                    selectedTableName={this.state.selectedTableName}
                  />}
              </Content>
            </Layout>
          </Content>
        </Layout>
      </div>
    );
  }
}
