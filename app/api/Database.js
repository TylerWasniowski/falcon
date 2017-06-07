// @flow
import { db } from 'falcon-core';
import path from 'path';
import type { DatabaseType } from '../types/DatabaseType';

// @TODO: Gets and returns an object to be used to set the state of Home
//        - How will ordering of databases and tables be dealt with? This
//          example is only given one database, so doesn't deal with it
export default async function getDatabases(): Promise<Array<DatabaseType>> {
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
