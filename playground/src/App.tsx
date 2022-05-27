import React from 'react';
import Grid, { GridColumnConfigType } from './grid';

type RecordType = {
  a: string;
  b: number;
  c: boolean;
}

const defaultRows: Array<RecordType> = [];
let i = 0
while (i < 100) {
  defaultRows.push({ a: `foo-${i++}`, b: 123 + i, c: i % 2 === 0 ? true : false })
}

const defaultColumns = [
  {
    header: () => 'A',
    value: (record: RecordType, { isSelected }: GridColumnConfigType) => (
      <div style={{ backgroundColor: isSelected ? 'red' : 'inherit' }}>{record.a}</div>
    ),
  },
  {
    header: () => 'B',
    value: (record: RecordType, { isSelected }: GridColumnConfigType) => (
      <div style={{ backgroundColor: isSelected ? 'red' : 'inherit' }}>{record.b}</div>
    ),
  },
  {
    header: () => 'C',
    value: (record: RecordType, { isSelected }: GridColumnConfigType) => (
      <div style={{ backgroundColor: isSelected ? 'red' : 'inherit' }}>{record.c === true ? 'yes' : 'no'}</div>
    ),
  }
];

export default function App() {
  return <Grid<RecordType> rows={defaultRows} columns={defaultColumns} />
}
