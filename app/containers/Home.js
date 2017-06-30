// @flow
import React, { Component } from 'react';
import { Layout, Menu, Breadcrumb, Icon, Button } from 'antd';
import { Link } from 'react-router-dom';
import { remote } from 'electron';
import GridWrapper from './GridWrapper';
import Query from './Query';
import getDatabases from '../api/Database';
import type { DatabaseType } from '../types/DatabaseType';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
const { dialog } = remote;

// @TODO: Home/Falcon's state can only deal with one database at a time
//        because of this.state.databasePath
export default class HomePage extends Component {
  state: {
    selectedTableName: ?string,
    databasePath: ?string,
    databases: ?Array<DatabaseType>,
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
          <Header className="header">
            <div className="logo" />
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['2']}
              style={{ lineHeight: '64px' }}
            >
              <Menu.Item key="1">
                <Link to="/home">Home</Link>
              </Menu.Item>
              <Menu.Item key="2">
                <Link to="/home">View</Link>
              </Menu.Item>
            </Menu>
          </Header>
          <Content>
            <Breadcrumb style={{ margin: '12px 0', padding: '0 50px' }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>Databases</Breadcrumb.Item>
              <Breadcrumb.Item>SQLite</Breadcrumb.Item>
            </Breadcrumb>
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
                  defaultOpenKeys={['compat-db']}
                  style={{ height: '100%' }}
                  onSelect={e => this.onSelectedTableNameChange(e, this)}
                >
                  <Menu.Item key="Query">
                    <Icon type="code" />
                    Query
                  </Menu.Item>
                  {this.state.databases.map(database =>
                    (<SubMenu
                      key="compat-db"
                      title={
                        <span>
                          <Icon type="database" />compat-db
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
