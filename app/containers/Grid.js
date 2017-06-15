// @flow
import React, { Component } from 'react';
import { Table } from 'antd';
import Structure from '../components/Structure';
import styles from './Grid.css';
import type { DatabaseType } from '../types/DatabaseType';
import type { PaginationType, SortedInfoType } from '../types/AntDesignTypes';

type Props = {
  databases: Array<DatabaseType>,
  pagination: {
    pageSize: number
  },
  selectedTableName: ?string,
  loading: boolean
};

export default class Grid extends Component {
  props: Props;

  state: {
    showStructure: boolean,
    sortedInfo: SortedInfoType | {}
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      showStructure: false,
      sortedInfo: {}
    };
  }

  handleChange = (
    pagination: PaginationType,
    filters: string[],
    sorter: SortedInfoType
  ) => {
    this.setState({
      sortedInfo: sorter
    });
  };

  onButtonClick = (e: SyntheticEvent) => {
    e.preventDefault();
    this.setState({
      showStructure: !this.state.showStructure
    });
  };

  render() {
    if (this.props.databases.length === 0 || !this.props.selectedTableName) {
      return <div />;
    }

    const foundColumns = this.props.databases[0].tables.find(
      e => e.tableName === this.props.selectedTableName
    );

    if (!foundColumns) {
      return <div />;
    }

    const { sortedInfo } = this.state;

    const columns = foundColumns.columns.map((e, i, array) => ({
      title: e,
      dataIndex: e,
      key: e,
      sorter: (a, b) => {
        if (typeof a[e] === 'number') {
          return a[e] - b[e];
        }
        if (typeof a[e] === 'string') {
          return a[e].localeCompare(b[e]);
        }
        throw new Error(`Cannot compare type of value: ${a[e]}`);
      },
      width: `${100 / array.length}%`,
      sortOrder: sortedInfo.columnKey === e && sortedInfo.order // is ok
    }));

    const columnNames = columns.map(column => column.title);
    const foundRows = this.props.databases[0].tables.find(
      e => e.tableName === this.props.selectedTableName
    );

    if (!foundRows) {
      return <div />;
    }

    const dataSource = foundRows.rows.map(e => {
      const newRow = {};
      e.value.forEach((each, index) => {
        newRow[columnNames[index]] = each;
      });
      return newRow;
    });

    return (
      <div>
        {(!this.state.showStructure &&
          <Table
            columns={columns}
            rowKey={record => record.registered}
            dataSource={dataSource}
            pagination={this.props.pagination}
            size="small"
            filterMultiple
            scroll={{ y: 400 }}
            loading={this.props.loading}
            onChange={this.handleChange}
          />) ||
          <Structure
            selectedTableName={this.props.selectedTableName}
            databases={this.props.databases}
            loading={this.props.loading}
          />}
        <div className={styles.controls}>
          <button
            disabled={!this.state.showStructure}
            onClick={this.onButtonClick}
          >
            Content
          </button>
          <button
            disabled={this.state.showStructure}
            onClick={this.onButtonClick}
          >
            Structure
          </button>
        </div>
      </div>
    );
  }
}
