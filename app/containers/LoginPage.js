// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import { Input, Col, Row, Select, InputNumber, Button } from 'antd';
import img from '../../resources/falcon.png';

const InputGroup = Input.Group;
const Option = Select.Option;
const logoStyle = {
  margin: '0 auto',
  display: 'block'
};

export default function LoginPage() {
  return (
    <Col span={24}>
      <Row type="flex" justify="center">
        <Col span={8} />
        <Col span={8}>
          <img
            style={logoStyle}
            src={img}
            width="100rem"
            height="100rem"
            alt="Logo"
          />
        </Col>
        <Col span={8} />
      </Row>
      <Col span={8} />
      <Col span={8}>
        <br />
        <InputGroup size="large">
          <Input
            size="large"
            defaultValue="My First Connection"
            placeholder="connection name"
          />
        </InputGroup>
        <br />
        <InputGroup compact>
          <Select size="large" defaultValue="sqlite">
            <Option value="sqlite">sqlite</Option>
            <Option value="mysql">mysql</Option>
            <Option value="postgres">postgres</Option>
            <Option value="cassandra">cassandra</Option>
          </Select>
        </InputGroup>
        <br />
        <InputGroup size="large">
          <Input size="large" defaultValue="localhost" placeholder="host" />
        </InputGroup>
        <br />
        <InputGroup size="large">
          <Input size="large" defaultValue="root" placeholder="username" />
        </InputGroup>
        <br />
        <InputGroup size="large">
          <Input size="large" placeholder="password" />
        </InputGroup>
        <br />
        <InputGroup size="large">
          <InputNumber
            placeholder="port"
            min={1}
            max={10}
            defaultValue={3306}
          />
        </InputGroup>
        <br />
        <Link to="/home">
          <Button
            id="connectButton"
            type="primary"
            loading={false}
            size="large"
          >
            Connect
          </Button>
        </Link>
      </Col>
      <Col span={8} />
    </Col>
  );
}
