import React from 'react';
import Grid from './grid';

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
    value: (record: RecordType) => record.a,
  },
  {
    header: () => 'B',
    value: (record: RecordType) => record.b,
  },
  {
    header: () => 'C',
    value: (record: RecordType) => record.c === true ? 'yes' : 'no',
  }
];

export default function App() {
  return <Grid<RecordType> rows={defaultRows} columns={defaultColumns} />
}
