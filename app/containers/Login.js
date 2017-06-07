// @flow
import React, { Component } from 'react';
import LoginSideBar from './LoginSideBar';
import type { LoginDatabaseType } from '../types/LoginDatabaseType';
import styles from './Login.css';

export default class Login extends Component {
  state: {
    currentDatabase: LoginDatabaseType,
    savedDatabases: Array<LoginDatabaseType>,
    // Set to default values or values loaded from saved side bar database
    placeholderFields: Object,
    databaseEngines: Array<string>
  };

  constructor(props: { history: Object }) {
    super(props);
    this.state = {
      currentDatabase: {
        type: 'Cassandra',
        fields: {
          nickname: '',
          host: '',
          username: '',
          password: '',
          port: ''
        }
      },
      savedDatabases: [],
      placeholderFields: {
        nickname: '',
        host: 'localhost',
        username: '',
        password: '',
        port: '7199'
      },
      databaseEngines: ['Cassandra', 'MySQL', 'SQLite']
    };
  }

  // Used when <select> changes its value so that fields are re-rendered
  setTemplateDatabase = (engine: 'Cassandra' | 'MySQL' | 'SQLite') => {
    switch (engine) {
      case 'Cassandra':
        return this.setCurrentDatabase({
          type: 'Cassandra',
          fields: {
            nickname: '',
            host: 'localhost',
            username: '',
            password: '',
            port: 7199
          }
        });
      case 'MySQL':
        return this.setCurrentDatabase({
          type: 'MySQL',
          fields: {
            nickname: '',
            host: 'localhost',
            username: '',
            password: '',
            port: 3306
          }
        });
      case 'SQLite':
        return this.setCurrentDatabase({
          type: 'SQLite',
          fields: {
            nickname: '',
            file: ''
          }
        });
      default:
        throw new Error(`Unknown database type "${engine}" given`);
    }
  };

  handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    this.props.history.push('/home');
  };

  // Adds to state.savedDatabases if it's not already in there
  addToSaved = (e: SyntheticEvent) => {
    e.preventDefault();
    if (this.isDatabaseSaved(this.state.currentDatabase)) {
      return;
    }
    const fieldsKeys = Object.keys(this.state.currentDatabase.fields);
    const copy: LoginDatabaseType = {
      ...this.state.currentDatabase,
      fields: { nickname: '' }
    };

    fieldsKeys.forEach(key => {
      copy.fields[key] =
        this.state.currentDatabase.fields[key] ||
        this.state.placeholderFields[key];
    });

    // Sorts then saves databases
    this.setState({
      savedDatabases: [
        ...this.state.savedDatabases,
        copy
      ].sort((a: LoginDatabaseType, b: LoginDatabaseType) =>
        a.fields.nickname.localeCompare(b.fields.nickname)
      )
    });
  };

  // Sets this.state.currentDatabase and this.state.placeholderFields
  setCurrentDatabase = (database: LoginDatabaseType) => {
    const emptyFields = { nickname: '' };
    Object.keys(database.fields).forEach(field => {
      emptyFields[field] = '';
    });
    const copy: LoginDatabaseType = { ...database, fields: emptyFields };
    this.setState({
      placeholderFields: { ...database.fields },
      currentDatabase: copy
    });
  };

  isDatabaseSaved = (database: LoginDatabaseType) =>
    this.state.savedDatabases.some(
      el => el.fields.nickname === database.fields.nickname
    );

  render() {
    const selectOptions = this.state.databaseEngines.map(engine =>
      <option key={engine} value={engine}>{engine}</option>
    );

    const inputFields = Object.keys(
      this.state.currentDatabase.fields
    ).map(field =>
      (<div key={field}>
        <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
        <input
          type="text"
          name={field}
          value={this.state.currentDatabase.fields[field]}
          placeholder={this.state.placeholderFields[field]}
          onChange={e => {
            const currentDatabase = Object.assign(
              {},
              this.state.currentDatabase
            );
            currentDatabase.fields[field] = e.target.value;
            this.setState({ currentDatabase });
          }}
        />
      </div>)
    );

    return (
      <div>
        <LoginSideBar
          savedDatabases={this.state.savedDatabases}
          setCurrentDatabase={this.setCurrentDatabase}
        />
        <div className={styles.login}>
          <img
            src="../resources/falcon.png"
            width="300em"
            height="225em"
            alt="Logo"
          />
          <p className={styles.versionNum}>v 0.0.1</p>
          <form onSubmit={this.handleSubmit}>
            {inputFields}
            <select
              onChange={e => this.setTemplateDatabase(e.target.value)}
              id="databaseEngine"
              name="databaseEngine"
            >
              {selectOptions}
            </select>
            <div className={styles.controls}>
              <button onClick={this.addToSaved}>Add to Favorites</button>
              <input type="submit" value="Submit" />
            </div>
          </form>
        </div>
      </div>
    );
  }
}
