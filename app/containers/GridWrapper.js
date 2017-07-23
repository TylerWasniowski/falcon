// @flow
/* eslint no-underscore-dangle: ["error", { "allow": ["_index"] }] */
/* eslint react/prop-types: 0 */

import React, { Component } from 'react';
import ReactTable from 'react-table';
import { ipcRenderer } from 'electron';
import _ from 'lodash';
import Structure from '../components/Structure';
import styles from './GridWrapper.css';
import SpecialTypeMarker from '../components/SpecialTypeMarker';
import type { DatabaseType } from '../types/DatabaseType';
import type { TableType } from '../types/TableType';
import { DELETE_ROW_CHANNEL } from '../types/channels';

function getAllNumbersBetween(x: number, y: number) {
  const numbers = [];
  const min = Math.min(x, y);
  const max = Math.max(x, y);
  for (let i = min; i <= max; i += 1) {
    numbers.push(i);
  }
  return numbers;
}

function removeFromArrayAtIndex(array, index) {
  array.splice(index, 1);
}

type Props = {
  databases: Array<DatabaseType>,
  selectedTableName: string
};

export default class GridWrapper extends Component {
  state: {
    foundTable: ?TableType,
    showStructure: boolean,
    loading: boolean,
    selectedRowIndex: ?number,
    selectedRowsIndices: Set<number>,
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
      selectedRowsIndices: new Set(),
      selectedCellColumnId: null,
      selectedCellRowIndex: null,
      tableData: [],
      tableColumns: []
    };
    ipcRenderer.on(DELETE_ROW_CHANNEL, () => {
      this.handleSelectedRowsDeletion();
    });
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
                  this.handleCellSaving(
                    event.target.value,
                    row.index,
                    row.column.Header
                  );
                }}
                onKeyDown={event => {
                  const returnKeyCharCode = event.keyCode;
                  if (returnKeyCharCode === 13) {
                    this.handleCellSaving(
                      event.target.value,
                      row.index,
                      row.column.Header
                    );
                  }
                }}
              />
            </div>
          );
        } else if (!row.value) {
          return <SpecialTypeMarker value="NULL" />;
        }
        return (
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              userSelect: 'none'
            }}
          >
            {row.value}
          </div>
        );
      }
    }));

  handleCellSaving = (
    newCellcontent: string,
    rowIndex: number,
    rowHeader: string
  ) => {
    const tableData = _.cloneDeep(this.state.tableData);
    tableData[rowIndex][rowHeader] = newCellcontent;
    this.setState({
      tableData,
      selectedCellColumnId: null,
      selectedCellRowIndex: null
    });
  };

  handleButtonClick = (e: SyntheticEvent) => {
    e.preventDefault();
    this.setState({
      showStructure: !this.state.showStructure
    });
  };

  handleRowSelection = (rowIndex: number) => {
    this.setState({
      selectedRowIndex: rowIndex,
      selectedRowsIndices: new Set().add(rowIndex),
      selectedCellColumnId: null,
      selectedCellRowIndex: null
    });
  };

  handleCtrlRowSelection = (rowIndex: number) => {
    const { selectedRowIndex, selectedRowsIndices } = this.state;
    // Treat like regular row selection
    if (!selectedRowIndex) {
      this.handleRowSelection(rowIndex);
    } else if (selectedRowIndex === rowIndex) {
      // Remove row selectedRowsIndices and make selectedRow = the row below, above, or null
      const sortedIndices = [...selectedRowsIndices].sort();
      selectedRowsIndices.delete(selectedRowIndex);
      this.setState({
        selectedRowIndex:
          sortedIndices[sortedIndices.indexOf(selectedRowIndex + 1)] ||
          sortedIndices[sortedIndices.indexOf(selectedRowIndex - 1)] ||
          null,
        selectedRowsIndices: new Set(selectedRowsIndices),
        selectedCellColumnId: null,
        selectedCellRowIndex: null
      });
    } else if (selectedRowsIndices.has(rowIndex)) {
      // Just remove item from selectedRowIndices
      selectedRowsIndices.delete(rowIndex);
      this.setState({
        selectedRowsIndices: new Set(selectedRowsIndices),
        selectedCellColumnId: null,
        selectedCellRowIndex: null
      });
    } else {
      // Row not selected. Add it and make it the new slselectedRowIndex
      this.setState({
        selectedRowIndex: rowIndex,
        selectedRowsIndices: new Set(selectedRowsIndices.add(rowIndex)),
        selectedCellColumnId: null,
        selectedCellRowIndex: null
      });
    }
  };

  handleShiftRowSelection = (rowIndex: number) => {
    // If no selectedRowIndex, treat shiftClick like a regular click
    if (!this.state.selectedRowIndex) {
      this.handleRowSelection(rowIndex);
    }
    this.setState({
      selectedRowsIndices: new Set(
        getAllNumbersBetween(this.state.selectedRowIndex, rowIndex)
      ),
      selectedCellColumnId: null,
      selectedCellRowIndex: null
    });
  };

  handleCellSelection = (cellColumnId: number, cellRowIndex: number) => {
    this.setState({
      selectedCellColumnId: cellColumnId,
      selectedCellRowIndex: cellRowIndex
    });
  };
  handleSelectedRowsDeletion = () => {
    const tableData = _.cloneDeep(this.state.tableData);
    const selectedRowsIndices = [...this.state.selectedRowsIndices];
    selectedRowsIndices.forEach((e, i) => {
      // At each removal, need to subtract i to compensate for shorter array
      const indexToRemove = e - i;
      removeFromArrayAtIndex(tableData, indexToRemove);
    });
    this.setState({
      tableData,
      selectedRowsIndices: new Set(),
      selectedCellRowIndex: null
    });
  };

  componentWillMount = () => {
    this.setState({ loading: true });
    if (this.props.databases.length === 0) return;
    const foundTable = this.props.databases[0].tables.find(
      e => e.tableName === this.props.selectedTableName
    );
    if (!foundTable) {
      throw new Error(`Table ${this.props.selectedTableName} not found`);
    }
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
    if (!foundTable) {
      throw new Error(`${this.props.selectedTableName}could not be found`);
    }
    this.setState({
      foundTable,
      loading: false,
      tableData: this.getTableData(foundTable),
      tableColumns: this.getTableColumns(foundTable),
      selectedRowIndex: null,
      selectedRowsIndices: new Set(),
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
                // @TODO: 83vh is a hack to fill space
                style={{ height: '83vh' }}
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
                    style:
                      rowInfo !== undefined &&
                      this.state.selectedRowsIndices.has(rowInfo.row._index)
                        ? { backgroundColor: '#0B54D5', color: 'white' }
                        : {},
                    onClick: e => {
                      if (e.metaKey) {
                        this.handleCtrlRowSelection(rowInfo.row._index);
                      } else if (e.shiftKey) {
                        this.handleShiftRowSelection(rowInfo.row._index);
                      } else {
                        this.handleRowSelection(rowInfo.row._index);
                      }
                    }
                  };
                }}
                getTdProps={(state, rowInfo, column) => ({
                  onDoubleClick: () => {
                    this.handleCellSelection(column.id, rowInfo.row._index);
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
            onClick={this.handleButtonClick}
          >
            Content
          </button>
          <button
            disabled={this.state.showStructure}
            onClick={this.handleButtonClick}
          >
            Structure
          </button>
        </div>
      </div>
    );
  }
}
