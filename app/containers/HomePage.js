// @flow
import React, { Component } from 'react';
import { Layout, Menu, Icon } from 'antd';
import { ipcRenderer } from 'electron';
import GridWrapper from './GridWrapper';
import BreadcrumbWrapper from '../components/BreadcrumbWrapper';
import Query from './Query';
import getDatabases from '../api/Database';
import type { DatabaseType } from '../types/DatabaseType';
import { OPEN_FILE_CHANNEL } from '../types/channels';

const { SubMenu } = Menu;
const { Content, Sider } = Layout;

/* @TODO: Home/Falcon's can only deal with one database at a time
        because of this.state.databasePath and databases[0]
*/
export default class HomePage extends Component {
  state: {
    selectedTableName?: string,
    databasePath?: string,
    databases: Array<DatabaseType>,
    showQuery: boolean,
    siderCollapsed: boolean
  };

  didMount: boolean = false;

  constructor(props: {}) {
    super(props);
    this.state = {
      databases: [],
      showQuery: false,
      siderCollapsed: false
    };
    ipcRenderer.on(OPEN_FILE_CHANNEL, (event, filePath) => {
      this.setDatabaseResults(filePath);
    });
  }

  setDatabaseResults = async (filePath: string) => {
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
    if (!this.state.selectedTableName) { throw new Error('this.state.selectedTableName is falsey'); }
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
    if (
      !(
        this.state.databases &&
        this.state.selectedTableName &&
        this.state.databasePath
      )
    ) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            marginTop: '50vh'
          }}
        >
          <h2>
            {'File -> Open File'}
          </h2>
          <br />
          <h4>
            {'To import an SQLite database'}
          </h4>
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
                  // @TODO: height: 78vh is a hack for sidebar to fill space
                  overflow: 'auto',
                  height: '90vh'
                }}
                collapsible
                collapsedWidth={0}
                trigger={null}
                collapsed={this.state.siderCollapsed}
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
                      key={database.databaseName}
                      title={
                        <span>
                          <Icon type="database" /> {database.databaseName}
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
              <Icon
                className="trigger"
                type={this.state.siderCollapsed ? 'menu-unfold' : 'menu-fold'}
                style={{ fontSize: '200%', color: '#08c' }}
                onClick={() => this.setState({ siderCollapsed: !this.state.siderCollapsed })}
              />
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
