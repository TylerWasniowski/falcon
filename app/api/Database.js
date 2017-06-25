// @flow
import { db } from 'falcon-core';
import path from 'path';
import type { exportOptionsType, ProviderInterfaceType } from 'falcon-core';
import type { DatabaseType } from '../types/DatabaseType';

/**
 * @TODO: Make this the default export. Classese are a better choice for
 *        database connections, which are stateful. They require a constant
 *        connunication with the database. A purely functional approach would require
 *        Killing the database connection after each request, which isn't all
 *        that performant
 *
 * @TODO: Consider using **object pools**
 *
 * This class should be treated as a singleton. Creating multiple connections will waste
 * memory.
 */

type configType = {
  serverInfo: {
    database: string
  }
};

export class Database {
  /**
   * @TODO: Write a flow-typed definition for falcon-core so we can just import
   *        the type here. Migrate from weak types
   */
  connection: {
    client: 'sqlite' | 'mysql' | 'postgresql',
    connect: configType => void,
    executeQuery: (
      conn: string
    ) => Promise<Array<ProviderInterfaceType.queryResponseType>>
  };

  config: configType;

  // @TODO
  // pool: Map<string, { databaseName: string }>

  session: {
    createConnection: (databaseName: string) => ProviderInterfaceType
  };

  /**
   * @HACK: The database is temporarily hardcoded to a fixed sqlite database.
   *        This is just for demo purposes for the time being
   */
  constructor() {
    this.config = {
      serverInfo: {
        database: path.join('app', 'demo.sqlite'),
        client: 'sqlite'
      }
    };
    this.session = db.createServer(this.config.serverInfo);
  }

  async connect() {
    this.connection = await this.session.createConnection(
      this.config.serverInfo.database
    );
    if (!this.connection) {
      throw new Error('Connection has not been established yet');
    }
    this.connection.connect(this.config.serverInfo);
  }

  async sendQueryToDatabase(
    query: string
  ): Promise<Array<ProviderInterfaceType.queryResponseType>> {
    return this.connection.executeQuery(query);
  }

  static getDatabases = getDatabases;
}

// @TODO: Gets and returns an object to be used to set the state of Home
//        - How will ordering of databases and tables be dealt with? This
//          example is only given one database, so doesn't deal with it
async function getDatabases(): Promise<Array<DatabaseType>> {
  const databasePath = path.join('app', 'demo.sqlite');
  const serverInfo = {
    database: databasePath,
    client: 'sqlite'
  };
  const serverSession = db.createServer(serverInfo);
  const connection = await serverSession.createConnection(databasePath);
  await connection.connect(serverInfo);
  const databases: Array<string> = await connection.listDatabases();
  const tables: Array<string> = await connection
    .listTables()
    .then(each => each.map(s => s.name));

  return Promise.all(
    databases.map(databaseName =>
      // @TODO: Dynamically create connections for each table. For now, we're
      //        expecting there to be only one database, and therefore only one
      //        connection
      Promise
        // Get the values of each table
        .all(tables.map(table => connection.getTableValues(table)))
        // For each table of the current database, format the rows
        .then((databaseTableValues: Array<Array<Object>>) =>
          databaseTableValues.map((table, tableIndex) => ({
            databaseName,
            tableName: tables[tableIndex],
            columns: Object.keys(table[0]),
            rows: table.map((value, index) => ({
              rowID: value[Object.keys(value)[index]],
              value: Object.values(value)
            }))
          }))
        )
    )
  ).then(_databases =>
    _databases.map((database, databaseIndex) => ({
      tables: database,
      databaseName: databases[databaseIndex]
    }))
  );
}

type exportType = 'json' | 'csv';

export async function exportFile(
  type: exportType,
  exportPath: string,
  exportOptions: exportOptionsType
): Promise<string> {
  const databasePath = path.join('app', 'demo.sqlite');
  const serverInfo = {
    database: databasePath,
    client: 'sqlite'
  };
  const serverSession = db.createServer(serverInfo);
  const connection = await serverSession.createConnection(databasePath);

  await connection.connect(serverInfo);

  switch (type) {
    case 'json':
      return connection.exportJson(exportPath, exportOptions);
    case 'csv':
      return connection.exportCsv(exportPath, exportOptions);
    default:
      throw new Error(`Invalid or unsupported export type "${type}"`);
  }
}

export default getDatabases;

export type DatabaseApiType = {
  connection: {
    client: 'sqlite' | 'mysql' | 'postgresql',
    connect: configType => void,
    executeQuery: (
      conn: string
    ) => Promise<Array<ProviderInterfaceType.queryResponseType>>
  },
  config: configType,
  session: {
    createConnection: string => ProviderInterfaceType
  },
  connect: () => void,
  sendQueryToDatabase: (
    query: string
  ) => Promise<Array<ProviderInterfaceType.queryResponseType>>
};
