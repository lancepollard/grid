import React, { useCallback, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import DataGridColumn, {
  DataGridColumnConfigType,
  DataGridHeaderPropsType,
} from './Column';
import DataGridContext from './Context';
import DataGridBlock, { DataGridBlockPropsType } from './Block';
import DataGridManager from './Manager';
import {
  DataGridRowType,
  DataGridSelectModeType,
  DataGridEventType,
} from './types';
import { convertEventToSelectMode } from './helpers';
import useCounter from './useCounter';
import useDataGrid from './useDataGrid';

export type {
  DataGridColumnConfigType,
  DataGridBlockPropsType,
  DataGridSelectModeType,
  DataGridHeaderPropsType,
  DataGridEventType,
};

export {
  convertEventToSelectMode,
  useDataGrid,
  DataGridContext,
  DataGridManager,
  DataGridColumn,
  DataGridBlock,
};

type DataGridConfigType = {
  onKeyUp: (event: React.KeyboardEvent<HTMLElement>) => void;
  gridRef: React.RefObject<HTMLElement>;
};

type DataGridPropsType = {
  grid: DataGridManager;
  children: (
    rows: Array<DataGridRowType>,
    config: DataGridConfigType
  ) => React.ReactElement;
};

export default function DataGrid({
  grid,
  children,
}: DataGridPropsType): React.ReactElement {
  const bind = useCallback(
    (callback: () => void) => grid.bindGrid(callback),
    [grid]
  );
  const gridRef = useRef(null);

  const handleClickOutside = useCallback(() => {
    grid.deselect();
  }, [grid]);

  useOnClickOutside(gridRef, handleClickOutside);

  useCounter(bind);

  const onKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (grid.isEditing()) {
        return;
      }

      switch (event.code) {
        case 'Backspace':
          event.preventDefault();
          event.stopPropagation();
          grid.deleteHighlights();
          break;
        case 'KeyZ':
          if (event.metaKey && event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
            grid.redo();
          } else if (event.metaKey) {
            event.preventDefault();
            event.stopPropagation();
            grid.undo();
          }
          break;
        case 'KeyV':
          if (event.metaKey) {
            event.preventDefault();
            event.stopPropagation();
            navigator.clipboard
              .readText()
              // throw error if don't have permission for now
              .then(text => {
                grid.loadSpreadsheetText(text);
              });
          }
          break;
        case 'KeyC':
          if (event.metaKey) {
            event.preventDefault();
            event.stopPropagation();
            const text = grid.copyHighlightedText();
            if (text) {
              navigator.clipboard.writeText(text);
            }
          }
          break;
        case 'KeyX':
          if (event.metaKey) {
            event.preventDefault();
            event.stopPropagation();
            const text = grid.cutHighlightedText();
            if (text) {
              navigator.clipboard.writeText(text);
            }
          }
          break;
        case 'Tab':
          event.preventDefault();
          event.stopPropagation();
          grid.navigateRight();
          break;
        case 'Escape':
          event.preventDefault();
          event.stopPropagation();
          // stop editing
          grid.editBlockExit();
          break;
        case 'Enter':
          event.preventDefault();
          event.stopPropagation();
          // start editing
          grid.editBlockEnter();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          event.stopPropagation();
          grid.setSelectMode(convertEventToSelectMode(event));
          grid.navigateLeft();
          break;
        case 'ArrowRight':
          event.preventDefault();
          event.stopPropagation();
          grid.setSelectMode(convertEventToSelectMode(event));
          grid.navigateRight();
          break;
        case 'ArrowUp':
          event.preventDefault();
          event.stopPropagation();
          grid.setSelectMode(convertEventToSelectMode(event));
          grid.navigateUp();
          break;
        case 'ArrowDown':
          event.preventDefault();
          event.stopPropagation();
          grid.setSelectMode(convertEventToSelectMode(event));
          grid.navigateDown();
          break;
        default:
          break;
      }
    },
    [grid]
  );

  const rows: Array<DataGridRowType> = [];
  grid.rows.forEach(row => rows.push(row));

  return (
    <DataGridContext.Provider value={grid}>
      {children(rows, { onKeyUp, gridRef })}
    </DataGridContext.Provider>
  );
}
