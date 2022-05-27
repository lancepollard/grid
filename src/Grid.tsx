import React, { useCallback, useState, useContext, useEffect, useMemo, useRef } from 'react';
import getKeyCode from 'keycode';

export type GridColumnConfigType = {
  isSelected: boolean;
  isEditing: boolean;
};

export type GridColumnType<T> = {
  header: () => React.ReactNode;
  value: (record: T, config: GridColumnConfigType) => React.ReactNode;
};

const GridContext = React.createContext({
  subscribe: (row: number, column: number, callback: (selected: boolean, editing: boolean) => void) => {},
  unsubscribe: (row: number, column: number) => {},
  setIndex: (row: number, column: number) => {},
});

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
  rowIndex: number;
  columnIndex: number;
};

function GridValue<T>({ record, column, rowIndex, columnIndex }: GridValuePropsType<T>): React.ReactElement {
  const { subscribe, unsubscribe, setIndex } = useContext(GridContext);
  const [isSelected, setIsSelected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const tdRef = useRef() as React.MutableRefObject<HTMLTableCellElement>;

  useEffect(() => {
    const updateSelect = (selected: boolean, editing: boolean) => {
      tdRef.current.focus();
      setIsSelected(selected);
      setIsEditing(editing);
    }

    subscribe(rowIndex, columnIndex, updateSelect);

    return () => unsubscribe(rowIndex, columnIndex);
  }, [subscribe, unsubscribe, setIsSelected, setIsEditing]);

  const handleRowClick = useCallback(() => {
    setIndex(rowIndex, columnIndex);
  }, [setIndex, rowIndex, columnIndex]);

  return (
    <td tabIndex={0} ref={tdRef} onClick={handleRowClick}>{column.value(record, { isSelected, isEditing })}</td>

  )
}

type GridRowPropsType<T> = {
  record: T;
  columns: Array<GridColumnType<T>>;
  rowIndex: number;
}

function GridRow<T>({ rowIndex, record, columns }: GridRowPropsType<T>) {
  return (
    <tr>{columns.map((column, columnIndex) => (
      <GridValue<T>
        record={record}
        column={column}
        rowIndex={rowIndex}
        columnIndex={columnIndex}
      />
    ))}</tr>
  );
}

export default function Grid<T>({
  rows,
  columns,
}: GridType<T>): React.ReactElement {
  const selectedValueIndex = [-1, -1];
  const subscriptions = useMemo(() => new Map(), []);
  const setIndex = useCallback((row: number, column: number) => {
    const oldCallback = subscriptions.get(`${selectedValueIndex[0]}:${selectedValueIndex[1]}`);
    if (oldCallback) {
      oldCallback(false);
    }
    selectedValueIndex[0] = row;
    selectedValueIndex[1] = column;
    const callback = subscriptions.get(`${row}:${column}`);
    if (callback) {
      callback(true);
    }
  }, [selectedValueIndex])

  const subscribe = useCallback((row: number, column: number, callback: (selected: boolean, editing: boolean) => void): void => {
    subscriptions.set(`${row}:${column}`, callback);
  }, [subscriptions]);

  const unsubscribe = useCallback((row: number, column: number): void => {
    subscriptions.delete(`${row}:${column}`);
  }, [subscriptions]);

  const state = { subscribe, unsubscribe, setIndex };

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLTableElement>) => {
    if (typeof event.code !== 'string') {
      return
    }

    switch (event.code) {
      case 'ArrowLeft':
        setIndex(selectedValueIndex[0], Math.max(0, selectedValueIndex[1] - 1))
        break
      case 'ArrowRight':
        setIndex(selectedValueIndex[0], Math.min(selectedValueIndex[1] + 1, rows.length - 1))
        break
      case 'ArrowUp':
        setIndex(Math.max(0, selectedValueIndex[0] - 1), selectedValueIndex[1])
        break
      case 'ArrowDown':
        setIndex(Math.min(selectedValueIndex[0] + 1, columns.length - 1), selectedValueIndex[1])
        break
    }
  }, [setIndex]);

  return (
    <GridContext.Provider value={state}>
      <table onKeyUp={handleKeyPress}>
        <thead>
          <tr>
            {columns.map(column => <GridColumn {...column} />)}
          </tr>
        </thead>
        <tbody>
          {rows.map((record, rowIndex) => (
            <GridRow<T> record={record} columns={columns} rowIndex={rowIndex} />
          ))}
        </tbody>
      </table>
    </GridContext.Provider>
  )
}
