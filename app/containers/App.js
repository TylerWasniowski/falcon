// @flow
import React, { Component } from 'react';
import type { Children } from 'react';

type Props = { children: Children };
type State = { selectedDatabasePath: ?string };

export default class App extends Component<Props, State> {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
