import React, { ReactElement } from 'react';
import { BlockFormatterPropsType } from '../types';

type FormatterPropsType = BlockFormatterPropsType & {
  data?: string;
};

function Formatter({ data }: FormatterPropsType): ReactElement {
  return <span>{data}</span>;
}

export default Formatter;
