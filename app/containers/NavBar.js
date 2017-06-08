// @flow
import React, { Component } from 'react';
import styles from './NavBar.css';

export default class NavBar extends Component {
  state: {
    sections: Array<string>
  };

  constructor(props: {}) {
    super(props);
    this.state = {
      sections: ['Link1', '#query', 'Link3']
    };
  }

  render() {
    const links = this.state.sections.map(section =>
      <li key={section}><a href={section}>{section}</a></li>
    );

    return (
      <div className={styles.navbarWrapper}>
        <div className={styles.navbar}>
          <ul>
            {links}
          </ul>
        </div>
      </div>
    );
  }
}
