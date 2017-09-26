// @flow
import React, { Component } from 'react';
import type { Children } from 'react';

type Props = { children: Children };

export default class App extends Component<Props, void> {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
