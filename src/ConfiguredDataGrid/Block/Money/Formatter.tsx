import React, { ReactElement } from 'react';
import { formatMoney } from '@utils/money';
import { BlockFormatterPropsType } from '../types';

type FormatterPropsType = BlockFormatterPropsType & {
  data?: MoneyType;
};

function Formatter({ data }: FormatterPropsType): ReactElement {
  const formattedValue = formatMoney(data, 'compact');

  return <span>{formattedValue}</span>;
}

export default Formatter;
