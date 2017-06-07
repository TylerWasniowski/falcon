// @flow

// Used in Home.js to display database contents
export type LoginDatabaseType = {
  type: 'Cassandra' | 'MySQL' | 'SQLite',
  fields: {
    nickname: string
  }
};
