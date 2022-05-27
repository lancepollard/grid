import React from 'react';
export declare type GridColumnConfigType = {
    isSelected: boolean;
    isEditing: boolean;
};
export declare type GridColumnType<T> = {
    header: () => React.ReactNode;
    value: (record: T, config: GridColumnConfigType) => React.ReactNode;
};
declare type GridType<T> = {
    columns: Array<GridColumnType<T>>;
    rows: Array<T>;
};
export default function Grid<T>({ rows, columns, }: GridType<T>): React.ReactElement;
export {};
