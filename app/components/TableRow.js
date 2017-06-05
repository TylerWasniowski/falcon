// @flow
import React from 'react';

const TableRow = ({ rowEntries }: { rowEntries: Array<string> }) => {
  const rows = rowEntries.map(value => <td key={Math.random()}>{value}</td>);
  return (
    <tr>
      {rows}
    </tr>
  );
};

export default TableRow;
