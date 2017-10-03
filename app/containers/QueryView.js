// @flow
/* eslint no-underscore-dangle: ["error", { "allow": ["_index"] }] */
/* eslint react/prop-types: 0 */
import React, { Component } from 'react';
import _ from 'lodash';
import { message } from 'antd';
import AceEditor from 'react-ace';
import ReactTable from 'react-table';
import debounce from 'lodash/debounce';
import type { queryResponseType } from 'falcon-core';
import 'brace';
import 'brace/mode/sql';
import 'brace/snippets/sql';
import 'brace/theme/xcode';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import SpecialTypeMarker from '../components/SpecialTypeMarker';
import styles from './QueryView.css';
import { Database } from '../api/Database';

type Props = {
  databasePath: string
};

type State = {
  result: queryResponseType,
  query: string,
  database: Database,
  selectedRowIndex: ?number,
  selectedCellColumnId: ?number,
  selectedCellRowIndex: ?number,
  tableData: Array<{ [key: string]: string | number | boolean }>,
  tableColumns: Array<{ Header: string, accessor: string }>
};

export default class QueryView extends Component<Props, State> {
  didMount: boolean = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      result: {},
      query: '',
      database: new Database(this.props.databasePath),
      selectedRowIndex: null,
      selectedCellColumnId: null,
      selectedCellRowIndex: null,
      tableData: [],
      tableColumns: []
    };
  }

  async onInputChange(query: string, self: QueryView) {
    if (!self || !self.didMount) {
      return;
    }

    this.setState({ query });
    try {
      const resultsArray = await this.state.database.sendQueryToDatabase(
        this.state.query
      );
      this.setState({
        result: resultsArray[0],
        tableData: this.getTableData(resultsArray[0]),
        tableColumns: this.getTableColumns(resultsArray[0])
      });
    } catch (error) {
      message.error(error.message);
    }
  }

  getTableData = (result: queryResponseType) => {
    const tableHeaders = result.fields.map(e => e.name);
    const tableData = result.rows.map((e) => {
      const tableRow = {};
      tableHeaders.forEach((header) => {
        tableRow[header] = e[header];
      });
      return tableRow;
    });
    return tableData;
  };

  getTableColumns = (result: queryResponseType) =>
    result.fields.map((e) => {
      const obj = {
        Header: e.name,
        accessor: e.name,
        Cell: (row) => {
          if (
            this.state.selectedCellColumnId === e.name &&
            this.state.selectedCellRowIndex === row.index
          ) {
            return (
              <div style={{ color: 'black' }}>
                <input
                  defaultValue={row.value}
                  autoFocus
                  style={{ width: '100%' }}
                  onBlur={(event) => {
                    const tableData = _.cloneDeep(this.state.tableData);
                    tableData[row.index][row.column.Header] =
                      event.target.value;
                    this.setState({ tableData });
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
                whiteSpace: 'nowrap'
              }}
            >
              {row.value}
            </div>
          );
        }
      };
      return obj;
    });

  async componentDidMount() {
    this.didMount = true;
    await this.state.database.connect();
    this.onInputChange(this.state.query, this);
  }

  componentWillUnmount() {
    this.didMount = false;
  }

  render() {
    // If results aren't ready, then return just the editor
    if (!this.state.tableData) {
      return (
        <div>
          <AceEditor
            mode="sql"
            theme="xcode"
            name="querybox"
            value={this.state.query}
            focus
            width={'100%'}
            height={'200px'}
            onChange={debounce(e => this.onInputChange(e, this), 500)}
            showPrintMargin={false}
            editorProps={{ $blockScrolling: Infinity }}
            enableBasicAutocompletion
            enableSnippets
            enableLiveAutocompletion={false}
          />
          <div className={styles.controls}>
            <button>Save Query</button>
            <button>Load Query</button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <AceEditor
          mode="sql"
          theme="xcode"
          name="querybox"
          value={this.state.query}
          focus
          width={'100%'}
          height={'200px'}
          onChange={debounce(e => this.onInputChange(e, this), 500)}
          showPrintMargin={false}
          editorProps={{ $blockScrolling: Infinity }}
          enableBasicAutocompletion
          enableSnippets
          enableLiveAutocompletion={false}
        />
        <div className={styles.controls}>
          <button>Save Query</button>
          <button>Load Query</button>
        </div>
        {this.state.result.fields &&
          <div className="table-wrap">
            <ReactTable
              style={{ height: '52vh' }}
              className="-striped -highlight"
              columns={this.state.tableColumns}
              data={this.state.tableData}
              defaultPageSize={100}
              minRows={15}
              pageSizeOptions={[100, 500, 1000]}
              getTrProps={(params, rowInfo) => ({
                // @TODO: If below line isn't used, some table don't render.
                //        Find out why and fix
                style:
                  rowInfo !== undefined &&
                  rowInfo.row._index === this.state.selectedRowIndex
                    ? { backgroundColor: '#0B54D5', color: 'white' }
                    : {},
                onClick: () => {
                  this.setState({
                    selectedRowIndex: rowInfo.row._index,
                    selectedCellColumnId: null,
                    selectedCellRowIndex: null
                  });
                }
              })}
              getTdProps={(state, rowInfo, column) => ({
                onDoubleClick: () => {
                  this.setState({
                    selectedCellColumnId: column.id,
                    selectedCellRowIndex: rowInfo.row._index
                  });
                }
              })}
            />
          </div>}
      </div>
    );
  }
}
