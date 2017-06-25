// @flow
/* eslint no-underscore-dangle: ["error", { "allow": ["_index"] }] */
import React, { Component } from 'react';
import ReactTable from 'react-table';
import _ from 'lodash';
import Structure from '../components/Structure';
import styles from './GridWrapper.css';
import type { DatabaseType } from '../types/DatabaseType';
import type { TableType } from '../types/TableType';

type Props = {
  databases: Array<DatabaseType>,
  selectedTableName: ?string
};

export default class GridWrapper extends Component {
  props: Props;

  state: {
    foundTable: ?TableType,
    showStructure: boolean,
    loading: boolean,
    selectedRowIndex: ?number,
    selectedCellColumnId: ?number,
    selectedCellRowIndex: ?number,
    tableData: Array<{ [key: string]: string | number | boolean }>,
    // @TODO: Cell currently unannotated
    tableColumns: Array<{ Header: string, accessor: string }>
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      foundTable: null,
      showStructure: false,
      loading: true,
      selectedRowIndex: null,
      selectedCellColumnId: null,
      selectedCellRowIndex: null,
      tableData: [],
      tableColumns: []
    };
  }

  getTableData = (table: TableType) => {
    const rows = [...table.rows];
    const tableHeaders = [...table.columns];
    const tableData = rows.map(e => {
      const tableRow = {};
      tableHeaders.forEach((header, i) => {
        tableRow[header] = e.value[i];
      });
      return tableRow;
    });
    return tableData;
  };

  getTableColumns = (table: TableType) =>
    table.columns.map(e => ({
      Header: e,
      accessor: e,
      Cell: row => {
        if (
          this.state.selectedCellColumnId === e &&
          this.state.selectedCellRowIndex === row.index
        ) {
          return (
            <div style={{ color: 'black' }}>
              <input
                defaultValue={row.value}
                autoFocus
                style={{ width: '100%' }}
                onBlur={event => {
                  const tableData = _.cloneDeep(this.state.tableData);
                  tableData[row.index][row.column.Header] = event.target.value;
                  this.setState({ tableData });
                }}
              />
            </div>
          );
        } else if (!row.value) {
          return (
            <div
              style={{
                backgroundColor: '#FFF8B2',
                padding: '2px 5px',
                borderRadius: '2px',
                width: 'min-content',
                textOverflow: 'ellipsis'
              }}
            >
              NULL
            </div>
          );
        }
        return (
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
          >
            {row.value}
          </div>
        );
      }
    }));

  onButtonClick = (e: SyntheticEvent) => {
    e.preventDefault();
    this.setState({
      showStructure: !this.state.showStructure
    });
  };

  componentWillMount = () => {
    this.setState({ loading: true });
    if (this.props.databases.length === 0) return;
    const foundTable = this.props.databases[0].tables.find(
      e => e.tableName === this.props.selectedTableName
    );
    this.setState({
      foundTable,
      loading: false,
      tableData: this.getTableData(foundTable),
      tableColumns: this.getTableColumns(foundTable)
    });
  };

  componentWillReceiveProps = (nextProps: Props) => {
    this.setState({ loading: true });
    if (nextProps.databases.length === 0) return;
    const foundTable = nextProps.databases[0].tables.find(
      e => e.tableName === nextProps.selectedTableName
    );
    this.setState({
      foundTable,
      loading: false,
      tableData: this.getTableData(foundTable),
      tableColumns: this.getTableColumns(foundTable),
      selectedRowIndex: null,
      selectedCellColumnId: null,
      selectedCellRowIndex: null
    });
  };

  render() {
    return (
      <div className={styles.container}>
        <div>
          {(!this.state.showStructure &&
            <div className="table-wrap">
              <ReactTable
                style={{ height: '72vh' }}
                className="-striped -highlight"
                columns={this.state.tableColumns}
                data={this.state.tableData}
                defaultPageSize={100}
                loading={this.state.loading}
                minRows={15}
                pageSizeOptions={[100, 500, 1000]}
                getTrProps={(params, rowInfo) => {
                  // @TODO: If below line isn't used, some table don't render.
                  //        Find out why and fix
                  if (rowInfo === undefined) return {};
                  return {
                    style: rowInfo !== undefined &&
                      rowInfo.row._index === this.state.selectedRowIndex
                      ? { backgroundColor: '#0B54D5', color: 'white' }
                      : {},
                    onClick: e => {
                      e.preventDefault();
                      this.setState({
                        selectedRowIndex: rowInfo.row._index,
                        selectedCellColumnId: null,
                        selectedCellRowIndex: null
                      });
                    }
                  };
                }}
                getTdProps={(state, rowInfo, column) => ({
                  onDoubleClick: () => {
                    this.setState({
                      selectedCellColumnId: column.id,
                      selectedCellRowIndex: rowInfo.row._index
                    });
                  }
                })}
              />
            </div>) ||
            <Structure
              selectedTableName={this.props.selectedTableName}
              databases={this.props.databases}
            />}
        </div>
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
