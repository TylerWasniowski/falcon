// @flow
import React, { Component } from 'react';
import { Input, Col, Select } from 'antd';
import AceEditor from 'react-ace';
import 'brace';
import 'brace/mode/sql';
import 'brace/snippets/sql';
import 'brace/theme/xcode';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import type { TableKeyType } from '../api/Database';

const InputGroup = Input.Group;
const Option = Select.Option;

type Props = {
  selectedTableName: string,
  tableKeysPromise: Promise<Array<TableKeyType>>
};

export default class Structure extends Component {
  state: { tableKeys: ?Array<TableKeyType> };
  constructor(props: Props) {
    super(props);
    this.state = { tableKeys: null };
  }

  async componentDidMount() {
    this.setState({ tableKeys: await this.props.tableKeysPromise });
  }

  async componentWillReceiveProps(nextProps: Props) {
    this.setState({ tableKeys: await nextProps.tableKeysPromise });
  }

  render() {
    console.log(this.state);
    if (!this.state.tableKeys) return <div />;
    return (
      <div>
        <InputGroup>
          <Col span={10}>
            <span>Table Name</span>
            <Input defaultValue={this.props.selectedTableName} />
          </Col>
        </InputGroup>
        <br />

        <span>View Definition</span>
        <AceEditor
          mode="sql"
          theme="xcode"
          name="querybox"
          ref="queryBoxTextarea"
          value={'PLACEHOLDER TEXT'}
          width={'100%'}
          height={'200px'}
          showPrintMargin={false}
          editorProps={{ $blockScrolling: Infinity }}
          enableBasicAutocompletion
          enableSnippets
          enableLiveAutocompletion={false}
        />
        <br />

        <div>
          <div style={{ display: 'inline-block', width: '5%' }}>ID</div>
          <div style={{ display: 'inline-block', width: '22%' }}>
            Column Name
          </div>
          <div style={{ display: 'inline-block', width: '15%' }}>Type</div>
          <div style={{ display: 'inline-block', width: '20%' }}>
            Default Value
          </div>
          <div style={{ display: 'inline-block', width: '10%' }}>
            Primary Key
          </div>
          <div style={{ display: 'inline-block', width: '28%' }}>
            Constraints
          </div>
        </div>
        {this.state.tableKeys.map(column =>
          (<InputGroup key={column.cid} compact>
            <Input style={{ width: '5%' }} defaultValue={column.cid} />
            <Input style={{ width: '22%' }} defaultValue={column.name} />
            <Input style={{ width: '15%' }} defaultValue={column.type} />
            <Input style={{ width: '20%' }} defaultValue={column.dflt_value} />
            <Input style={{ width: '10%' }} defaultValue={column.pk} />
            <Input style={{ width: '28%' }} defaultValue={column.notnull} />
          </InputGroup>)
        )}
        <br />
        <h2>Indexes</h2>
        <Col span={8}>Index Name</Col>
        <Col span={8}>Type</Col>
        <Col span={8}>Columns</Col>
        <InputGroup compact>
          <Input style={{ width: '33.3%' }} defaultValue="placeholder" />
          <Input style={{ width: '33.3%' }} defaultValue="placeholder" />
          <Input style={{ width: '33.3%' }} defaultValue="placeholder" />
        </InputGroup>
        <br />
      </div>
    );
  }
}
