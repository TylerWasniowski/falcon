// @flow
export type TableType = {

  // @TODO: Temporary. Not sure how else to store the state
  //        of a table's parent for tab breadcrumb routing
  //        rows.columnName used as a key for TableRow. Temporary
  databaseName: string,
  tableName: string,
  columns: Array<string>,
  rows: Array<{
    rowID: string,
    value: Array<string>
  }>
};
