import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { BlockEditorPropsType } from '../types';

type EditorPropsType = BlockEditorPropsType & {
  data?: MoneyType;
};

function Editor({
  data,
  onUpdate,
  onExitEdit,
  focusRef,
}: EditorPropsType): ReactElement {
  const [stateData, setStateData] = useState(data);

  useEffect(() => {
    setStateData(data);
  }, [data]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.code) {
        case 'Escape':
          event.stopPropagation();
          event.preventDefault();
          setStateData(data);
          onExitEdit();
          break;
        case 'Enter':
          event.stopPropagation();
          event.preventDefault();
          onUpdate(stateData);
          onExitEdit();
          break;
        default:
          break;
      }
    },
    [onUpdate, data, stateData, onExitEdit]
  );

  // as you type, enter save it locally,
  // until you formally commit and exit editing mode.
  const handleInput = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      setStateData({
        __typename: 'Money',
        currency: stateData?.currency ?? 'USD',
        amount: parseFloat((event.target as HTMLInputElement).value),
      });
    },
    [stateData, setStateData]
  );

  const inputValue = stateData?.amount;

  return (
    <input
      autoFocus
      ref={focusRef as React.RefObject<HTMLInputElement>}
      onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      defaultValue={inputValue}
    />
  );
}

export default Editor;
