// @flow
import React from 'react';
import type { TableType } from '../types/TableType';
import styles from './Tab.css';
import '../app.global.css';

const Tab = ({ table }: { table: ?TableType }) => {
  if (!table) {
    return <div className={styles.tab} />;
  }

  return (
    <div className={styles.tab}>
      <span className={styles.tabContent}>
        {table.databaseName}
        &nbsp;<i className={`fa fa-chevron-right ${styles.arrow}`} />&nbsp;
        {table.tableName}
      </span>
    </div>
  );
};

export default Tab;
