import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import cx from 'classnames';
import {
  DataGridContext,
  convertEventToSelectMode,
} from '@components/DataGrid';
import { BlockFormatterComponentType } from '../types';
import { AlignType } from '../../types';

import styles from '../Container/index.module.scss';

type FormatiblePropsType = {
  width: number;
  align: AlignType;
  data?: MoneyType;
  isSelected: boolean;
  isFocused: boolean;
  isHighlighted: boolean;
  onSelect: () => void;
  onMouseEnter: (event: React.MouseEvent<HTMLElement>) => void;
  formatter: BlockFormatterComponentType;
};

function Formatible({
  width,
  align,
  isSelected,
  isFocused,
  isHighlighted,
  data,
  onSelect,
  onMouseEnter,
  formatter,
}: FormatiblePropsType): ReactElement {
  const grid = useContext(DataGridContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const Formatter = formatter;

  const className = cx(
    styles.block,
    isSelected ? styles.blockIsSelected : undefined,
    isFocused ? styles.blockIsFocused : undefined,
    isHighlighted ? styles.blockIsHighlighted : undefined,
    styles[`${align}Align`]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLElement>): void => {
      event.preventDefault();
      event.stopPropagation();

      grid.editBlockExit();
      grid.setSelectMode(convertEventToSelectMode(event));

      onSelect();
    },
    [grid, onSelect]
  );

  useEffect(() => {
    if (containerRef.current && isFocused) {
      containerRef.current.focus();
    }
  }, [containerRef, isFocused]);

  const style = { width };

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseDown={handleMouseDown}
      ref={containerRef}
      style={style}
      tabIndex={1}
      className={className}
      unselectable="on"
    >
      <div className={styles.backdrop} />
      <div className={styles.content}>
        <Formatter data={data} />
      </div>
    </div>
  );
}

export default Formatible;
