import React from 'react';
import {
  DataGridBlockPropsType,
  DataGridHeaderPropsType,
  DataGridColumnConfigType,
  DataGridColumn,
} from '@components/DataGrid';
import BasicHeader from '../Header/Basic';
import { AlignType, EditorType, FormatterType } from '../types';
import Formatible from '../Block/Formatible';
import Editable from '../Block/Editable';
import { Formatters, Editors } from '../Block/components';

export type ConfiguredDataGridColumnType = {
  // the label for the header
  header: string;
  // fetching the property from the record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: string;
  // convert text (such as from copy/paste) to the primitive or object structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deserializer?: (text: string) => any;
  // convert the data structure to a string for copying
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serializer?: (data: any) => string;
  // the editor to use for this type of data
  editor?: EditorType;
  // the basic renderer to use for this data
  formatter: FormatterType;
  // how wide the column is
  width?: number;
  // sorting function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sorter?: (a: any, b: any) => number;
  // alignment
  align?: AlignType;
};

// here we construct the lower-level config object
// the `DataGrid` uses to build the header and blocks.
export function serializeColumn(
  config: ConfiguredDataGridColumnType
): DataGridColumnConfigType {
  const Formatter = Formatters[config.formatter];
  const Editor = config.editor ? Editors[config.editor] : undefined;

  const width = config.width ?? 100;
  const align = config.align ?? 'left';

  return {
    key: config.header,
    width,
    header: ({
      width: w,
      isSelected,
      isHighlighted,
      onSelect,
    }: DataGridHeaderPropsType) => (
      <BasicHeader
        width={w ?? width}
        isSelected={isSelected}
        isHighlighted={isHighlighted}
        onSelect={onSelect}
      >
        {config.header}
      </BasicHeader>
    ),
    block: ({
      width: w,
      data,
      isSelected,
      isEditable,
      isEditing,
      isFocused,
      isHighlighted,
      onUpdate,
      onEnterEdit,
      onExitEdit,
      onSelect,
      onMouseEnter,
    }: DataGridBlockPropsType) => {
      if (Editor) {
        return (
          <Editable
            width={w ?? width}
            align={align}
            data={data}
            isSelected={isSelected}
            isEditable={isEditable}
            isEditing={isEditing}
            isFocused={isFocused}
            isHighlighted={isHighlighted}
            onUpdate={onUpdate}
            onEnterEdit={onEnterEdit}
            onExitEdit={onExitEdit}
            onSelect={onSelect}
            onMouseEnter={onMouseEnter}
            formatter={Formatter}
            editor={Editor}
          />
        );
      }

      return (
        <Formatible
          width={w ?? width}
          align={align}
          data={data}
          isSelected={isSelected}
          isFocused={isFocused}
          isHighlighted={isHighlighted}
          onSelect={onSelect}
          onMouseEnter={onMouseEnter}
          formatter={Formatter}
        />
      );
    },
  };
}

// not yet doing any extra overrides here, so just forwarding.
export default DataGridColumn;
