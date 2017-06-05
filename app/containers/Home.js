// @flow
import React, { Component } from 'react';
import getDatabases from '../api/Database';
import Table from '../containers/Table';
import SideBar from '../containers/SideBar';
import NavBar from '../containers/NavBar';
import Tab from '../components/Tab';
import styles from './Home.css';
import type { TableType } from '../types/TableType';
import type { DatabaseType } from '../types/DatabaseType';

export default class HomePage extends Component {
  state: {
    selectedTable: ?TableType,
    databases: Array<DatabaseType>
  };

  constructor(props: Object = {}) {
    super(props);
    this.state = {
      selectedTable: null,
      databases: []
    };
    this.setDatabaseResults();
  }

  async setDatabaseResults() {
    const databases = await getDatabases();
    this.setState({ databases });
  }

  render() {
    return (
      <div>
        <NavBar />
        <SideBar
          databases={this.state.databases}
          onTableSelect={selectedTable => this.setState({ selectedTable })}
        />
        <Tab table={this.state.selectedTable} />
        <div className={styles.container} data-tid="container">
          <Table table={this.state.selectedTable} />
        </div>
      </div>
    );
  }
}
