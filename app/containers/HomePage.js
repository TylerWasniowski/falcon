// @flow
import React, { Component } from 'react';
import { Layout, Menu, Icon, Button } from 'antd';
import { remote } from 'electron';
import GridWrapper from './GridWrapper';
import BreadcrumbWrapper from '../components/BreadcrumbWrapper';
import Query from './Query';
import getDatabases from '../api/Database';
import type { DatabaseType } from '../types/DatabaseType';

const { SubMenu } = Menu;
const { Content, Sider } = Layout;
const { dialog } = remote;

/* @TODO: Home/Falcon's can only deal with one database at a time
        because of this.state.databasePath and databases[0]
*/
export default class HomePage extends Component {
  state: {
    selectedTableName: ?string,
    databasePath: ?string,
    databases: Array<DatabaseType>,
    showQuery: boolean
  };

  didMount: boolean = false;

  constructor(props: {}) {
    super(props);
    this.state = {
      selectedTableName: null,
      databasePath: null,
      databases: [],
      showQuery: false
    };
  }

  setDatabaseResults = async () => {
    const filePath = dialog.showOpenDialog({
      filters: [{ name: 'SQLite', extensions: ['sqlite', 'db'] }],
      title: 'Set a database'
    })[0];
    const databases = await getDatabases(filePath);
    this.setState({
      databases,
      selectedTableName: databases[0].tables[0].tableName,
      databasePath: filePath
    });
  };

  onSelectedTableNameChange(subMenu: SubMenu, self: HomePage) {
    if (!self.didMount) {
      return;
    }

    this.setState({
      selectedTableName: subMenu.key,
      showQuery: subMenu.key === 'Query'
    });
  }

  getBreadcrumbRoute(): Array<string> {
    if (this.state.showQuery) {
      return ['Home', 'Databases', 'SQLite', 'Query'];
    }
    return [
      'Home',
      'Databases',
      'SQLite',
      this.state.databases[0].databaseName,
      this.state.selectedTableName
    ];
  }

  componentDidMount() {
    this.didMount = true;
  }

  componentWillUnmount() {
    this.didMount = false;
  }

  render() {
    if (!(this.state.databases && this.state.selectedTableName)) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '50vh'
          }}
        >
          <Button onClick={this.setDatabaseResults}>Set a database</Button>
        </div>
      );
    }
    return (
      <div>
        <Layout>
          <Content>
            <BreadcrumbWrapper routeItems={this.getBreadcrumbRoute()} />
            <Layout style={{ padding: '24px 0', background: '#fff' }}>
              <Sider
                width={200}
                style={{
                  background: '#fff',
                  // @TODO: height: 80vh is a hack for sidebar to fill space
                  overflow: 'auto',
                  height: '78vh'
                }}
              >
                <Menu
                  mode="inline"
                  defaultSelectedKeys={['1']}
                  defaultOpenKeys={[this.state.databases[0].databaseName]}
                  style={{ height: '100%' }}
                  onSelect={e => this.onSelectedTableNameChange(e, this)}
                >
                  <Menu.Item key="Query">
                    <Icon type="code" />
                    Query
                  </Menu.Item>
                  {this.state.databases.map(database =>
                    (<SubMenu
                      key={this.state.databases[0].databaseName}
                      title={
                        <span>
                          <Icon type="database" />{' '}
                          {this.state.databases[0].databaseName}
                        </span>
                      }
                    >
                      {database.tables.map(table =>
                        (<Menu.Item key={table.tableName}>
                          <Icon type="bars" />
                          {table.tableName}
                        </Menu.Item>)
                      )}
                    </SubMenu>)
                  )}
                </Menu>
              </Sider>
              <Content style={{ padding: '0 24px', minHeight: 280 }}>
                {this.state.showQuery
                  ? <Query databasePath={this.state.databasePath} />
                  : <GridWrapper
                    databases={this.state.databases}
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
