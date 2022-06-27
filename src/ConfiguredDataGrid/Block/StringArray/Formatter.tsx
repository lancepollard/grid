import React, { ReactElement } from 'react';
import { BlockFormatterPropsType } from '../types';

type FormatterPropsType = BlockFormatterPropsType & {
  data?: Array<string>;
};

function Formatter({ data }: FormatterPropsType): ReactElement {
  const formattedValue = data?.join(', ');

  return <span title={formattedValue}>{formattedValue}</span>;
}

export default Formatter;
