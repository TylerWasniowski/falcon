// @flow
import React, { Component } from 'react';
import { Input, Col } from 'antd';
import type { TableKeyType } from '../api/Database';

const InputGroup = Input.Group;

type Props = {
  selectedTableName: string,
  tableColumnsPromise: Promise<Array<TableKeyType>>
};

export default class Structure extends Component {
  state: {
    tableColumns: ?Array<TableKeyType>,
    loading: boolean
  };
  constructor(props: Props) {
    super(props);
    // Needs state.loading or else props.selectedName and state.tableColumns
    // won't align
    this.state = { tableColumns: null, loading: true };
  }

  async componentDidMount() {
    this.setState({
      tableColumns: await this.props.tableColumnsPromise,
      loading: false
    });
  }

  async componentWillReceiveProps(nextProps: Props) {
    this.setState({ loading: true });
    this.setState({
      tableColumns: await nextProps.tableColumnsPromise,
      loading: false
    });
  }

  render() {
    if (this.state.loading) return <div />;
    return (
      <div>
        <InputGroup>
          <Col span={10}>
            <span>Table Name</span>
            <Input defaultValue={this.props.selectedTableName} />
          </Col>
        </InputGroup>
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
        {this.state.tableColumns.map(column =>
          (<InputGroup
            key={`${this.props.selectedTableName}${column.cid}`}
            compact
          >
            <Input style={{ width: '5%' }} defaultValue={column.cid} />
            <Input style={{ width: '22%' }} defaultValue={column.name} />
            <Input style={{ width: '15%' }} defaultValue={column.type} />
            <Input
              style={{ width: '20%' }}
              defaultValue={column.dflt_defaultValue}
            />
            <Input style={{ width: '10%' }} defaultValue={column.pk} />
            <Input style={{ width: '28%' }} defaultValue={column.notnull} />
          </InputGroup>)
        )}
      </div>
    );
  }
}
