import { useRef } from 'react';
import DataGridManager from './Manager';

export default function useDataGrid(): DataGridManager {
  const ref = useRef<DataGridManager>();

  if (!ref.current) {
    ref.current = new DataGridManager();
  }

  return ref.current;
}
