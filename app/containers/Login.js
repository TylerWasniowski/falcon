// @flow
import React, { Component } from 'react';
import styles from './Login.css';

export default class Login extends Component {
  props: {
    history: {
      push: (history: string) => void
    }
  };

  state: {
    host: string,
    port: string,
    nickname: string
  };

  constructor(props: Object) {
    super(props);
    // For now, host, port, nickname localized to this component.
    // Will later be relevant to overall app
    this.state = {
      host: '',
      port: '',
      nickname: ''
    };
  }

  handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    this.props.history.push('/home');
  };

  render() {
    return (
      <div className={styles.login}>
        <img
          src="../resources/falcon.png"
          width="300em"
          height="225em"
          alt="Logo"
        />
        <p>v 0.0.1</p>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            value={this.state.host}
            name="host"
            placeholder="Host"
            onChange={e => this.setState({ host: e.target.value })}
            autoFocus
          />
          <input
            type="text"
            value={this.state.port}
            name="port"
            placeholder="Port"
            onChange={e => this.setState({ port: e.target.value })}
          />
          <input
            type="text"
            value={this.state.nickname}
            name="nickname"
            placeholder="Nickname"
            onChange={e => this.setState({ nickname: e.target.value })}
          />
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}
