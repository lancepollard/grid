import React from 'react';
import DataGrid, { DataGridManager } from '@components/DataGrid';
import ConfiguredDataGridColumn, {
  ConfiguredDataGridColumnType,
  serializeColumn,
} from './Column';
import ConfiguredDataGridBlock from './Block';
import ConfiguredDataGridDirtyButton from './DirtyButton';

import styles from './index.module.scss';

export type { ConfiguredDataGridColumnType };

export { ConfiguredDataGridDirtyButton };

type ConfiguredDataGridPropsType = {
  grid: DataGridManager;
  columns: Array<ConfiguredDataGridColumnType>;
};

// this is our basic implementation of the datagrid,
// so it appears consistent design-wise in all places we use it.
function ConfiguredDataGrid({
  grid,
  columns,
}: ConfiguredDataGridPropsType): React.ReactElement {
  const serializedColumns = columns.map(serializeColumn);

  return (
    <DataGrid grid={grid}>
      {(rows, { onKeyUp, gridRef }) => (
        <div
          tabIndex={0}
          onKeyDown={onKeyUp}
          className={styles.dataGrid}
          ref={gridRef as React.RefObject<HTMLTableElement>}
        >
          <div className={styles.header}>
            <div className={styles.headerRow}>
              {serializedColumns.map((column, i) => (
                <ConfiguredDataGridColumn
                  key={column.key}
                  index={i}
                  config={column}
                />
              ))}
            </div>
          </div>
          <div className={styles.body}>
            {rows.map((row, rowIndex) => (
              <div className={styles.bodyRow} key={row.key}>
                {serializedColumns.map((column, columnIndex) => {
                  // all blocks will exist by this point,
                  // even through TypeScript says it might be undefined.
                  const block = grid.getBlock(rowIndex, columnIndex);
                  return (
                    <ConfiguredDataGridBlock
                      key={block?.key}
                      column={column}
                      rowIndex={rowIndex}
                      columnIndex={columnIndex}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </DataGrid>
  );
}

export default ConfiguredDataGrid;
