// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import JSONPretty from 'react-json-pretty';
import AceEditor from 'react-ace';
import debounce from 'lodash/debounce';
import 'brace';
import 'brace/mode/sql';
import 'brace/snippets/sql';
import 'brace/theme/xcode';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import { Database } from '../api/Database';

type State = {
  query: string,
  result: Object
};

export default class Query extends Component {

  constructor(props, context) {
    super(props, context);
    this.database = new Database();
  }

  state: State = {
    query: [
      'SELECT sqlite_version()',
      '',
      '--SELECT name',
      '--FROM sqlite_master',
      "--WHERE type='table'",
      '--ORDER BY name',
    ].join('\n'),
    result: {}
  }

  onChange = async (query: string) => {
    this.setState({ query });
    const result = await this.database.sendQueryToDatabase(this.state.query);
    this.setState({ result });
  }

  componentDidMount() {
    this.database.connect();
  }

  render() {
    return (
      <div>
        <Link to="/">Back</Link>
        <AceEditor
          mode="sql"
          theme="xcode"
          name="querybox"
          ref="queryBoxTextarea"
          value={this.state.query}
          width={'100%'}
          height={'200px'}
          onChange={debounce(this.onChange, 500)}
          showPrintMargin={false}
          editorProps={{ $blockScrolling: Infinity }}
          enableBasicAutocompletion
          enableSnippets
          enableLiveAutocompletion={false}
        />
        <JSONPretty
          id="json-pretty"
          json={this.state.result}
        />
      </div>
    );
  }
}
