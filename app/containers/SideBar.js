// @flow
import React, { Component } from 'react';
import SideBarItem from './SideBarItem';
import type { DatabaseType } from '../types/DatabaseType';
import type { TableType } from '../types/TableType';
import styles from './SideBar.css';

export default class SideBar extends Component {
  props: {
    onTableSelect: (selectedTable: ?TableType) => void,
    databases: Array<DatabaseType>
  };

  render() {
    const databases = this.props.databases.map(database => (
      <SideBarItem
        key={database.databaseName}
        name={database.databaseName}
        onTableSelect={this.props.onTableSelect}
        tables={database.tables}
      />
    ));

    return (
      <div className={styles.sidebar}>
        <ul>
          {databases}
        </ul>
      </div>
    );
  }
}
