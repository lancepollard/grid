import React from 'react';
export declare type GridColumnType<T> = {
    header: () => React.ReactNode;
    value: (record: T) => React.ReactNode;
};
declare type GridType<T> = {
    columns: Array<GridColumnType<T>>;
    rows: Array<T>;
};
export default function Grid<T>({ rows, columns, }: GridType<T>): React.ReactElement;
export {};
