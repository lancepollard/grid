import React, { useCallback, useState, useContext, useEffect } from 'react';
import { DataGridColumnConfigType } from './Column';
import DataGridContext from './Context';
import { DataGridSelectModeType } from './types';

export type DataGridBlockPropsType = {
  width: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  isSelected: boolean;
  isEditing: boolean;
  isEditable: boolean;
  isFocused: boolean;
  isHighlighted: boolean;
  onUpdate: (value: unknown) => void;
  onEnterEdit: () => void;
  onExitEdit: () => void;
  onSelect: () => void;
  onMouseEnter: (event: React.MouseEvent<HTMLElement>) => void;
};

type DataGridInternalBlockPropsType = {
  column: DataGridColumnConfigType;
  rowIndex: number;
  columnIndex: number;
};

function DataGridBlock({
  column,
  rowIndex,
  columnIndex,
}: DataGridInternalBlockPropsType): React.ReactElement {
  const grid = useContext(DataGridContext);
  const block = grid.getBlock(rowIndex, columnIndex);
  const [isSelected, setIsSelected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [data, setData] = useState<unknown>();

  const updateBindings = useCallback((): void => {
    if (!block) {
      return;
    }

    // internally these values change,
    // so we reupdate react with the latest values,
    // and react will only rerender if the values have changed
    setIsSelected(block.selected);
    setIsEditable(block.editable);
    setIsEditing(block.editing);
    setIsFocused(block.focused);
    setIsHighlighted(block.highlighted);
    setData(block.data);
  }, [block]);

  useEffect(() => {
    grid.bindBlock(rowIndex, columnIndex, updateBindings);

    return () => grid.unbindBlock(rowIndex, columnIndex);
  }, [grid, updateBindings, columnIndex, rowIndex]);

  // initialize block state
  useEffect(updateBindings, [updateBindings]);

  // plug this into your custom component
  // and call perhaps on mouse click to select the block
  const onSelect = useCallback(
    (mode?: DataGridSelectModeType) => {
      if (mode) {
        grid.setSelectMode(mode);
      }
      grid.selectBlock(rowIndex, columnIndex);
    },
    [grid, rowIndex, columnIndex]
  );

  // plug this into your custom component
  // and call perhaps after editing a value and pressing "enter"
  const onUpdate = useCallback(
    (v: unknown) => {
      const transaction = grid.createTransaction();
      transaction.setBlockData(rowIndex, columnIndex, v);
      grid.commitTransaction(transaction);
    },
    [grid, rowIndex, columnIndex]
  );

  // enter edit mode
  const onEnterEdit = useCallback(() => {
    grid.editBlockEnter();
  }, [grid]);

  // exit edit mode
  const onExitEdit = useCallback(() => {
    grid.editBlockExit();
  }, [grid]);

  const onMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLElement>): void => {
      // if you are not holding down click while moving mouse (aka dragging)
      if (event.buttons !== 1) {
        return;
      }

      // we want you to be holding down click, where now its in range mode
      grid.setSelectMode('range');

      grid.selectBlock(rowIndex, columnIndex);
    },
    [grid, rowIndex, columnIndex]
  );

  return column.block({
    width: column.width,
    data,
    isEditable,
    isSelected,
    isEditing,
    isFocused,
    isHighlighted,
    onUpdate,
    onSelect,
    onEnterEdit,
    onExitEdit,
    onMouseEnter,
  });
}

export default DataGridBlock;
