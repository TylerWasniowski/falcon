// @flow
import * as fs from 'fs';
import Store from 'electron-store';
import _ from 'lodash';
import { verifySqlite } from './Database';
import type { LoginSavedDatabaseType } from '../types/LoginSavedDatabaseType';

/**
 * Handles saving/loading of connections to electron-store.
 * Verifies nicknames, paths, and validity of file
 */
export default class Connections {
  store = new Store();

  constructor() {
    this.getSavedDatabases.bind(this);
    this.saveDatabase.bind(this);
    this.validateSave.bind(this);
    this.deleteSavedDatabase.bind(this);
  }

  /**
   * @return  saved databases local to the machine. If no such array exists,
   * returns an empty array
   */
  getSavedDatabases(): Array<LoginSavedDatabaseType> {
    return this.store.get('savedDatabases') || [];
  }

  /**
   * Saves the database to local storage. Throws an error if nickname is empty
   * or if no database is found
   * @return an array containing the new database
   */
  saveDatabase(
    databaseNickname: string,
    databasePath: string
  ): Array<LoginSavedDatabaseType> {
    const newDatabase = {
      nickname: databaseNickname,
      path: databasePath
    };

    const savedDatabases = this.store.get('savedDatabases') || [];

    if (this.validateSave(newDatabase)) {
      savedDatabases.push(newDatabase);
      this.store.set('savedDatabases', savedDatabases);
      return savedDatabases;
    }
    throw new Error('Saved databases need a nickname and a valid database');
  }

  /**
   * Validates a potentialDatabase. Database file must exist,
   * @return true if potentialDatabase valid, false if not
   */
  validateSave(potentialDatabase: LoginSavedDatabaseType): boolean {
    const savedDatabases = this.store.get('savedDatabases') || [];
    const { nickname, path } = potentialDatabase;
    return (
      Connections.validateDatabaseFilePath(path) &&
      nickname !== '' &&
      Connections.isDatabaseSaved(savedDatabases, potentialDatabase)
    );
  }

  /**
   * Deletes a savedDatabase from local storage
   * @return an array that does not contain that database
   */
  deleteSavedDatabase(
    savedDatabase: LoginSavedDatabaseType
  ): Array<LoginSavedDatabaseType> {
    const savedDatabases = _.cloneDeep(
      this.store.get('savedDatabases')
    ).filter(e => _.isEqual(e, savedDatabase));
    this.store.set('savedDatabases', savedDatabases);
    return savedDatabases;
  }

  /**
   * Validates a database file's path
   * @return true if databasefile exists and is .db, .sqlite, or sqlite3
   */
  static validateDatabaseFilePath(databasePath: string): boolean {
    const fileExtension = databasePath.substring(databasePath.lastIndexOf('.'));
    return (
      fs.existsSync(databasePath) &&
      (fileExtension === '.db' ||
        fileExtension === '.sqlite' ||
        fileExtension === '.sqlite3')
    );
  }

  /**
   * Checks if a given database file has a problem
   * @return true if no problem exists, the error if there is a problem
   */
  static async validateConnection(
    databasePath: string
  ): Promise<string | true> {
    return verifySqlite(databasePath);
  }

  /**
   * Checks if a database is saved in savedDatabases
   * @return true if saved, false if not
   */
  static isDatabaseSaved(
    savedDatabases: Array<LoginSavedDatabaseType>,
    database: LoginSavedDatabaseType
  ): boolean {
    return savedDatabases.some(e => _.isEqual(e, database));
  }
}
