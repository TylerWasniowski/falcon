// @flow
import React from 'react';

export type specialValueType =
  | 'integer'
  | 'float'
  | 'decimal'
  | 'double'
  | 'increments'
  | 'string'
  | 'varchar'
  | 'boolean'
  | 'enum'
  | 'binary'
  | 'json'
  | 'date'
  | 'null';

type Props = {
  value: any
};

// @TODO: Placeholders for all types except for null
const genericTypeMappings: { [value: string]: specialValueType } = {
  int: 'integer',
  integer: 'integer',
  float: 'float',
  string: 'string',
  varchar: 'varchar',
  boolean: 'boolean',
  enum: 'enum',
  binary: 'binary',
  json: 'json',
  date: 'date',
  decimal: 'decimal',
  increments: 'increments',
  undefined: 'null',
  null: 'null',
  NULL: 'null'
};

// @TODO: Placeholders for all types except for null
const colorMappings = {
  integer: 'white',
  float: 'white',
  decimal: 'white',
  double: 'white',
  increments: 'white',
  string: 'white',
  varchar: 'white',
  boolean: 'white',
  enum: 'white',
  binary: 'white',
  json: 'white',
  date: 'white',
  null: '#FFF8B2'
};

export default function SpecialTypeMarker(props: Props) {
  const type: specialValueType = genericTypeMappings[props.value];
  const color: string = colorMappings[type];
  if (type === 'null') {
    return (
      <div
        style={{
          backgroundColor: color,
          color: 'black',
          padding: '2px 5px',
          borderRadius: '2px',
          width: 'min-content',
          textOverflow: 'ellipsis',
          userSelect: 'none'
        }}
      >
        {props.value}
      </div>
    );
  }
}

// these are the only things that are colored
// null, boolean, enum,
