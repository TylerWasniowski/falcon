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
import type { DatabaseType } from '../types/DatabaseType';

const InputGroup = Input.Group;
const Option = Select.Option;

type Props = {
  databases: Array<DatabaseType>,
  selectedTableName: ?string
};

export default class Structure extends Component {
  state: {
    tableName: string
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      tableName: 'FooTable'
    };
  }

  render() {
    return (
      <div>
        <InputGroup>
          <Col span={10}>
            <span>Table Name</span>
            <Input defaultValue={this.state.tableName} />
          </Col>
          <Col span={2}>
            <span>Schema</span>
            <br />
            <Select defaultValue="text" style={{ width: '6.3vw' }}>
              <Option value="text">text</Option>
              <Option value="varchar">varchar</Option>
              <Option value="double">double</Option>
            </Select>
          </Col>
          <Col span={3}>
            <span>Tablespace</span>
            <br />
            <Select defaultValue="pg_default">
              <Option value="pg_default">pg_default</Option>
              <Option value="pg_global">pg_global</Option>
            </Select>
          </Col>
        </InputGroup>
        <br />

        <span>View Definition</span>
        <AceEditor
          mode="sql"
          theme="xcode"
          name="querybox"
          ref="queryBoxTextarea"
          value={"`SELECT * FROM 'users'`"}
          width={'100%'}
          height={'200px'}
          showPrintMargin={false}
          editorProps={{ $blockScrolling: Infinity }}
          enableBasicAutocompletion
          enableSnippets
          enableLiveAutocompletion={false}
        />
        <br />

        <Col span={6}>Column Name</Col>
        <Col span={6}>Type</Col>
        <Col span={6}>Default</Col>
        <Col span={6}>Contraints</Col>
        <InputGroup compact>
          <Input style={{ width: '25%' }} defaultValue="placeholder" />
          <Select defaultValue="integer" style={{ width: '25%' }}>
            <Option value="integer">integer</Option>
            <Option value="text">text</Option>
          </Select>
          <Select defaultValue="nodefault" style={{ width: '8%' }}>
            <Option value="nodefault">no default</Option>
            <Option value="constant">constant</Option>
            <Option value="expression">expression</Option>
            <Option value="sequence">sequence</Option>
          </Select>
          <Input style={{ width: '17%' }} defaultValue="placeholder" />
          <Input style={{ width: '25%' }} defaultValue="placeholder" />
        </InputGroup>
        <InputGroup compact>
          <Input style={{ width: '25%' }} defaultValue="placeholder" />
          <Select defaultValue="integer" style={{ width: '25%' }}>
            <Option value="integer">integer</Option>
            <Option value="text">text</Option>
          </Select>
          <Select defaultValue="nodefault" style={{ width: '8%' }}>
            <Option value="nodefault">no default</Option>
            <Option value="constant">constant</Option>
            <Option value="expression">expression</Option>
            <Option value="sequence">sequence</Option>
          </Select>
          <Input style={{ width: '17%' }} defaultValue="placeholder" />
          <Input style={{ width: '25%' }} defaultValue="placeholder" />
        </InputGroup>
        <InputGroup compact>
          <Input style={{ width: '25%' }} defaultValue="placeholder" />
          <Select defaultValue="integer" style={{ width: '25%' }}>
            <Option value="integer">integer</Option>
            <Option value="text">text</Option>
          </Select>
          <Select defaultValue="nodefault" style={{ width: '8%' }}>
            <Option value="nodefault">no default</Option>
            <Option value="constant">constant</Option>
            <Option value="expression">expression</Option>
            <Option value="sequence">sequence</Option>
          </Select>
          <Input style={{ width: '17%' }} defaultValue="placeholder" />
          <Input style={{ width: '25%' }} defaultValue="placeholder" />
        </InputGroup>
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
