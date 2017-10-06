// @flow
/* eslint no-underscore-dangle: ["error", { "allow": ["_index"] }] */
/* eslint react/prop-types: 0 */

import React, { Component } from 'react';
import ReactTable from 'react-table';
import { ipcRenderer } from 'electron';
import _ from 'lodash';
import Structure from '../components/Structure';
import styles from './TableView.css';
import { Database } from '../api/Database';
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

function removeFromArrayAtIndex(array: Array<any>, index: number) {
  array.splice(index, 1);
}

type Props = {
  databases: Array<DatabaseType>,
  databasePath: string,
  selectedTableName: string
};

type State = {
  foundTable: ?TableType,
  showStructure: boolean,
  loading: boolean,
  selectedRowIndex: ?number,
  selectedRowsIndices: Set<number>,
  selectedCellColumnId: ?number,
  selectedCellRowIndex: ?number,
  proposedDeletionsIndices: Array<number>,
  proposedInsertionsIndices: Array<number>,
  proposedUpdateIndices: Array<number>,
  tableData: Array<{ [key: string]: string | number | boolean }>,
  // @TODO: Cell currently unannotated
  tableColumns: Array<{ Header: string, accessor: string }>
};

export default class TableView extends Component<Props, State> {
  databaseApi: Database;
  state: State;

  constructor(props: Props) {
    super(props);
    this.databaseApi = new Database(this.props.databasePath);
    this.state = {
      foundTable: null,
      showStructure: false,
      loading: true,
      selectedRowIndex: null,
      selectedRowsIndices: new Set(),
      selectedCellColumnId: null,
      selectedCellRowIndex: null,
      proposedDeletionsIndices: [],
      proposedInsertionsIndices: [],
      proposedUpdateIndices: [],
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
    const tableData = rows.map((e) => {
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
      Cell: (row) => {
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
                onBlur={(event) => {
                  this.handleCellContentChange(
                    event.target.value,
                    row.index,
                    row.column.Header
                  );
                }}
                onKeyDown={(event) => {
                  const returnKeyCharCode = event.keyCode;
                  if (returnKeyCharCode === 13) {
                    this.handleCellContentChange(
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

  /**
   * Called whenever a cell's content changes. If the cell does not belong
   * to a newly inserted row, adds it to proposedUpdates
   */
  handleCellContentChange = (
    newCellcontent: string,
    rowIndex: number,
    rowHeader: string
  ) => {
    // Updates tableData
    const tableData = _.cloneDeep(this.state.tableData);
    tableData[rowIndex][rowHeader] = newCellcontent;
    this.setState({
      tableData,
      selectedCellColumnId: null,
      selectedCellRowIndex: null
    });
    if (!this.state.proposedInsertionsIndices.includes(rowIndex)) {
      this.setState({
        proposedUpdateIndices: [...this.state.proposedUpdateIndices, rowIndex]
      });
    }
  };

  handleButtonClick = (e: SyntheticEvent<>) => {
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
    if (selectedRowIndex === null || selectedRowIndex === undefined) {
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

  /**
   * Removes selected rows from the table
   */
  handleSelectedRowsDeletion = () => {
    const tableData = _.cloneDeep(this.state.tableData);
    const selectedRowsIndices = [...this.state.selectedRowsIndices];
    const proposedDeletionsIndices = [
      ...this.state.proposedDeletionsIndices,
      ...this.state.selectedRowsIndices
    ];
    selectedRowsIndices.forEach((e, i) => {
      // At each removal, need to subtract i to compensate for shorter array
      const indexToRemove = e - i;
      removeFromArrayAtIndex(tableData, indexToRemove);
    });
    this.setState({
      tableData,
      proposedDeletionsIndices,
      selectedRowsIndices: new Set(),
      selectedCellRowIndex: null
    });
  };

  handleInsertRows = async () => {
    const tableData = _.cloneDeep(this.state.tableData);
    const proposedInsertionsIndices = [
      ...this.state.proposedInsertionsIndices,
      tableData.length
    ];
    const columnInfo = await this.databaseApi.getTableColumns(
      this.props.selectedTableName
    );
    const newRow = {};
    columnInfo.forEach((column) => {
      newRow[column.name] = column.notnull ? 'PLACEHOLDER' : 'NULL';
    });
    tableData.push(newRow);
    this.setState({ tableData, proposedInsertionsIndices });
  };

  /**
   * proposedDeletionsIndices and proposedInsertionsIndices are used to track
   * which rows needs to be deleted/inserted. Sends this info to the api
   */
  handleSaveEdits = async () => {
    const {
      tableData,
      proposedDeletionsIndices,
      proposedInsertionsIndices,
      proposedUpdateIndices
    } = this.state;

    /*
    Saves insertions.
    Need to adjust indices because deletion modifies indices of tableData thus
    for each deletion index < an insertion index, decrement that insertion index
    */
    const actualInsertionsIndices = proposedInsertionsIndices.map((e) => {
      let actualInsertionIndex = e;
      proposedDeletionsIndices.forEach((deletionIndex) => {
        if (deletionIndex < e) {
          actualInsertionIndex -= 1;
        }
      });
      return actualInsertionIndex;
    });
    const proposedInsertions = actualInsertionsIndices.map(i => tableData[i]);

    /*
    Saves updates.
    Need to adjust indices because deletion modifies indices of tableData thus
    for each deletion index < an update index, decrement that update index
    */
    const actualUpdateIndices = proposedUpdateIndices.map((e) => {
      let actualUpdateIndex = e;
      proposedDeletionsIndices.forEach((deletionIndex) => {
        if (deletionIndex < e) {
          actualUpdateIndex -= 1;
        }
      });
      return actualUpdateIndex;
    });

    const tablePrimaryKey = await this.databaseApi.getPrimaryKeyColumn(
      this.props.selectedTableName
    );
    const proposedUpdates = actualUpdateIndices.map(e => ({
      rowPrimaryKeyValue: tableData[e][tablePrimaryKey.name],
      changes: tableData[e]
    }));

    this.databaseApi
      .insertRows(this.props.selectedTableName, proposedInsertions)
      .then(() =>
        this.databaseApi
          .updateRows(this.props.selectedTableName, proposedUpdates)
          .then(() =>
            this.databaseApi.deleteRows(
              this.props.selectedTableName,
              proposedDeletionsIndices
            )
          )
      );

    this.setState({
      proposedDeletionsIndices: [],
      proposedInsertionsIndices: [],
      proposedUpdateIndices: []
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

  componentDidMount = async () => {
    await this.databaseApi.connect();
  };

  /**
   * Occurs when state.selectedTableName changes. Should update tableData
   * and reset selection/editing state
   */
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
      selectedCellRowIndex: null,
      proposedDeletionsIndices: [],
      proposedInsertionsIndices: []
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
                    onClick: (e) => {
                      if (e.metaKey || e.ctrlKey) {
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
              tableColumnsPromise={this.databaseApi.getTableColumns(
                this.props.selectedTableName
              )}
              databaseApi={this.databaseApi}
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
          <button onClick={this.handleInsertRows}>Insert Row</button>
          <button onClick={this.handleSelectedRowsDeletion}>Delete</button>
          <button onClick={this.handleSaveEdits}>Save</button>
        </div>
      </div>
    );
  }
}
