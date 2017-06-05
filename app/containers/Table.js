// @flow
import React, { Component } from 'react';
import TableRow from '../components/TableRow';
import type { TableType } from '../types/TableType';
import styles from './Table.css';

export default class Table extends Component {
  props: {
    table: ?TableType
  };

  render() {
    if (!this.props.table) {
      return <span className={styles.placeholder}>Select a table</span>;
    }

    const tableRows = this.props.table.rows.map(currentRow =>
      <TableRow key={Math.random()} rowEntries={currentRow.value} />
    );

    return (
      <div data-tid="container">
        <table>
          <thead>
            {/* $FlowFixMe: Contains column names. Shouldn't worry about null
            since we would havereturned a temporary value. Refactor later */}
            <TableRow rowEntries={this.props.table.columns} />
          </thead>
          <tbody>
            {tableRows}
          </tbody>
        </table>
      </div>
    );
  }
}
