import React from 'react';

export type BlockFormatterPropsType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

export type BlockFormatterComponentType<P = {}> = React.FunctionComponent<
  BlockFormatterPropsType & P
>;

export type BlockEditorPropsType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  onUpdate: (value: unknown) => void;
  onExitEdit: () => void;
  focusRef: React.RefObject<HTMLElement>;
};

export type BlockEditorComponentType<P = {}> = React.FunctionComponent<
  BlockEditorPropsType & P
>;
