import React, { useCallback, useContext, useEffect, useState } from 'react';
import DataGridContext from './Context';
import { DataGridBlockPropsType } from './Block';

export type DataGridHeaderPropsType = {
  width: number;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: () => void;
};

export type DataGridColumnConfigType = {
  key: string;
  width: number;
  header: (props: DataGridHeaderPropsType) => React.ReactElement;
  block: (props: DataGridBlockPropsType) => React.ReactElement;
};

type DataGridInternalColumnPropsType = {
  config: DataGridColumnConfigType;
  index: number;
};

function DataGridColumn({
  config,
  index,
}: DataGridInternalColumnPropsType): React.ReactElement {
  const grid = useContext(DataGridContext);
  const gridColumn = grid.getHeader(index);
  const [isSelected, setIsSelected] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const updateBindings = useCallback((): void => {
    if (!gridColumn) {
      return;
    }

    // internally these values change,
    // so we reupdate react with the latest values,
    // and react will only rerender if the values have changed
    setIsSelected(gridColumn.selected);
    setIsHighlighted(gridColumn.highlighted);
  }, [gridColumn]);

  useEffect(() => {
    grid.bindHeader(index, updateBindings);

    return () => grid.unbindHeader(index);
  }, [index, grid, updateBindings]);

  const onSelect = useCallback(() => {
    grid.selectColumn(index);
  }, [grid, index]);

  return config.header({
    width: config.width,
    isSelected,
    isHighlighted,
    onSelect,
  });
}

export default DataGridColumn;
