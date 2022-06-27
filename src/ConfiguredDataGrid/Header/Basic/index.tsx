import React, { ReactElement, useContext, useCallback } from 'react';
import cx from 'classnames';
import {
  DataGridHeaderPropsType,
  DataGridContext,
  convertEventToSelectMode,
} from '@components/DataGrid';

import styles from './index.module.scss';

type BasicHeaderPropsType = DataGridHeaderPropsType & {
  children: React.ReactNode;
};

function BasicHeader({
  width,
  isSelected,
  isHighlighted,
  onSelect,
  children,
}: BasicHeaderPropsType): ReactElement {
  const grid = useContext(DataGridContext);

  const className = cx(
    styles.header,
    isSelected ? styles.isSelected : undefined,
    isHighlighted ? styles.isHighlighted : undefined
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>): void => {
      event.preventDefault();
      event.stopPropagation();

      grid.editBlockExit();
      grid.setSelectMode(convertEventToSelectMode(event));

      onSelect();
    },
    [grid, onSelect]
  );

  const style = { width };

  return (
    <div
      tabIndex={1}
      style={style}
      onClick={handleClick}
      className={className}
      unselectable="on"
    >
      <span>{children}</span>
    </div>
  );
}

export default BasicHeader;
