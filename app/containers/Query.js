// @flow
import React, { Component } from 'react';
import { message, Table } from 'antd';
import AceEditor from 'react-ace';
import debounce from 'lodash/debounce';
import 'brace';
import 'brace/mode/sql';
import 'brace/snippets/sql';
import 'brace/theme/xcode';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import type { queryResponseType } from 'falcon-core';
import styles from './Query.css';
import { Database } from '../api/Database';
import type { PaginationType, SortedInfoType } from '../types/AntDesignTypes';

export default class Query extends Component {
  state: {
    result: queryResponseType,
    query: string,
    sortedInfo: SortedInfoType | {},
    database: Database
  };

  didMount: boolean = false;

  constructor(props: {}) {
    super(props);
    this.state = {
      result: {},
      query: "SELECT * FROM 'albums'",
      sortedInfo: {},
      database: new Database()
    };
  }

  async onInputChange(query: string, self: Query) {
    if (!self || !self.didMount) {
      return;
    }

    this.setState({ query });

    try {
      const resultsArray = await this.state.database.sendQueryToDatabase(
        this.state.query
      );
      this.setState({ result: resultsArray[0] });
    } catch (error) {
      message.error(error.message);
    }
  }

  onTableChange(
    pagination: PaginationType,
    filters: string[],
    sorter: SortedInfoType,
    self: Query
  ) {
    if (!self || !self.didMount) {
      return;
    }

    this.setState({
      sortedInfo: sorter
    });
  }

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
    if (!this.state.result.fields) {
      return (
        <div>
          <AceEditor
            mode="sql"
            theme="xcode"
            name="querybox"
            ref="queryBoxTextarea"
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

    const { sortedInfo } = this.state;
    const columns = this.state.result.fields.map((e, i, array) => ({
      title: e.name,
      dataIndex: e.name,
      key: e.name,
      sorter: (a, b) => {
        if (typeof a[e.name] === 'number') {
          return a[e.name] - b[e.name];
        }
        if (typeof a[e.name] === 'string') {
          return a[e.name].localeCompare(b[e]);
        }
        throw new Error(`Cannot compare type of value: ${a[e.name]}`);
      },
      width: `${100 / array.length}%`,
      sortOrder: sortedInfo.columnKey === e.name && sortedInfo.order
    }));

    return (
      <div>
        <AceEditor
          mode="sql"
          theme="xcode"
          name="querybox"
          ref="queryBoxTextarea"
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
          <Table
            columns={columns}
            rowKey={record => record.registered}
            dataSource={this.state.result.rows}
            pagination={{ pageSize: 200 }}
            size="small"
            filterMultiple
            scroll={{ y: 400 }}
            loading={false}
            onChange={(a, b, c) => this.onTableChange(a, b, c, this)}
          />}
      </div>
    );
  }
}
