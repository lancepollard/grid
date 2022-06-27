import { DataGridChangesType } from './types';

class DataGridTransaction {
  changes: DataGridChangesType;

  constructor() {
    this.changes = new Map();
  }

  setBlockData(rowIndex: number, columnIndex: number, data: unknown): void {
    const blockKey = `${rowIndex}:${columnIndex}`;
    this.changes.set(blockKey, data);
  }
}

export default DataGridTransaction;
