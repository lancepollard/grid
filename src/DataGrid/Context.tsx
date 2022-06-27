import React from 'react';
import DataGridManager from './Manager';

const DataGridContext = React.createContext<DataGridManager>(
  new DataGridManager()
);

export default DataGridContext;
