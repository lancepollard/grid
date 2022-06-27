import { FormatterType, EditorType } from '../types';
import { BlockFormatterComponentType, BlockEditorComponentType } from './types';

import MoneyFormatter from './Money/Formatter';
import StringFormatter from './String/Formatter';
import StringArrayFormatter from './StringArray/Formatter';

import MoneyEditor from './Money/Editor';

// add any custom `ConfiguredDataGrid`
// formatters or editors in this file.

export const Formatters: Record<FormatterType, BlockFormatterComponentType> = {
  string: StringFormatter,
  money: MoneyFormatter,
  'string-array': StringArrayFormatter,
};

export const Editors: Record<EditorType, BlockEditorComponentType> = {
  money: MoneyEditor,
};
