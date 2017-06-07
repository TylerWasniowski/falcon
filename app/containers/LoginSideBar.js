// @flow
import React, { Component } from 'react';
import type { LoginDatabaseType } from '../types/LoginDatabaseType';
import styles from './LoginSideBar.css';

type Props = {
  savedDatabases: Array<LoginDatabaseType>,
  setCurrentDatabase: (database: LoginDatabaseType) => void
};

export default class LoginSideBar extends Component {
  state: {
    selectedSavedDatabase: ?LoginDatabaseType
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedSavedDatabase: null
    };
  }

  onClickHandler = (e: SyntheticEvent, database: LoginDatabaseType) => {
    e.preventDefault();
    this.props.setCurrentDatabase(database);
    this.setState({ selectedSavedDatabase: database });
  };

  render() {
    const databaseList = this.props.savedDatabases.map(
      (database: LoginDatabaseType) =>
        (<li key={database.fields.nickname}>
          <a href="#" onClick={e => this.onClickHandler(e, database)}>
            {database.fields.nickname}
          </a>
        </li>)
    );

    return (
      <div className={styles.loginSideBar}>
        <p>Saved Databases</p>
        <ul>
          {databaseList}
        </ul>
      </div>
    );
  }
}
