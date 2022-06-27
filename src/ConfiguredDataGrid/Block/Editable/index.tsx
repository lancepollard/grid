import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import cx from 'classnames';
import {
  DataGridBlockPropsType,
  DataGridContext,
  convertEventToSelectMode,
} from '@components/DataGrid';
import {
  BlockEditorComponentType,
  BlockFormatterComponentType,
} from '../types';
import { AlignType } from '../../types';

import styles from '../Container/index.module.scss';

type EditablePropsType = DataGridBlockPropsType & {
  data?: MoneyType;
  align: AlignType;
  editor: BlockEditorComponentType;
  formatter: BlockFormatterComponentType;
};

function Editable({
  width,
  align,
  isSelected,
  isEditable,
  isEditing,
  isFocused,
  isHighlighted,
  data,
  onSelect,
  onUpdate,
  onEnterEdit,
  onExitEdit,
  onMouseEnter,
  editor,
  formatter,
}: EditablePropsType): ReactElement {
  const grid = useContext(DataGridContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef(null);
  const Editor = editor;
  const Formatter = formatter;

  const className = cx(
    styles.block,
    isSelected ? styles.blockIsSelected : undefined,
    isEditing ? styles.blockIsEditing : undefined,
    isFocused ? styles.blockIsFocused : undefined,
    isHighlighted ? styles.blockIsHighlighted : undefined,
    isEditable ? styles.blockIsEditable : undefined,
    styles[`${align}Align`]
  );

  useEffect(() => {
    if (containerRef.current && isFocused) {
      containerRef.current.focus();
    }
  }, [containerRef, isEditing, isFocused]);

  const handleMouseDownFormatterMode = useCallback(
    (event: React.MouseEvent<HTMLElement>): void => {
      event.preventDefault();
      event.stopPropagation();

      grid.editBlockExit();
      grid.setSelectMode(convertEventToSelectMode(event));

      onSelect();
    },
    [grid, onSelect]
  );

  // this one helps so you can click in the padding area
  // and it focuses you on the input.
  const handleMouseDownEditorMode = useCallback(
    (event: React.MouseEvent<HTMLElement>): void => {
      event.preventDefault();
      event.stopPropagation();

      if (focusRef.current) {
        (focusRef.current as HTMLElement).focus();
      }
    },
    [focusRef]
  );

  const style = { width };

  if (isEditing) {
    return (
      <div
        tabIndex={1}
        className={className}
        style={style}
        onMouseDown={handleMouseDownEditorMode}
      >
        <div className={styles.backdrop} />
        <div className={styles.shadow} />
        <div className={styles.content}>
          <Editor
            data={data}
            onExitEdit={onExitEdit}
            onUpdate={onUpdate}
            focusRef={focusRef}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={onMouseEnter}
      ref={containerRef}
      style={style}
      tabIndex={1}
      onMouseDown={handleMouseDownFormatterMode}
      onDoubleClick={onEnterEdit}
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

export default Editable;
