import React from 'react';

export type GridColumnType<T> = {
  header: () => React.ReactNode;
  value: (record: T) => React.ReactNode;
};

type GridType<T> = {
  columns: Array<GridColumnType<T>>;
  rows: Array<T>;
};

type GridColumnPropsType<T> = GridColumnType<T>;

function GridColumn<T>(props: GridColumnPropsType<T>) {
  return (
    <th>{props.header()}</th>
  );
}

type GridValuePropsType<T> = {
  record: T;
  column: GridColumnType<T>;
};

function GridValue<T>({ record, column }: GridValuePropsType<T>): React.ReactElement {
  return (
    <td>{column.value(record)}</td>
  )
}

type GridRowPropsType<T> = {
  record: T;
  columns: Array<GridColumnType<T>>;
}

function GridRow<T>({ record, columns }: GridRowPropsType<T>) {
  return (
    <tr>{columns.map(column => <GridValue<T> record={record} column={column} />)}</tr>
  );
}

export default function Grid<T>({
  rows,
  columns,
}: GridType<T>): React.ReactElement {
  return (
    <table>
      <thead>
        <tr>
          {columns.map(column => <GridColumn {...column} />)}
        </tr>
      </thead>
      <tbody>
        {rows.map(record => (
          <GridRow<T> record={record} columns={columns} />
        ))}
      </tbody>
    </table>
  )
}
