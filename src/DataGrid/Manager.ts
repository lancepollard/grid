/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */

import { uniqueId } from 'lodash';
import UndoManager from '@utils/UndoManager';
import DataChangeManager from '@utils/DataChangeManager';
import DataGridTransaction from './Transaction';
import {
  DataGridUpdateFunctionType,
  DataGridBlockPositionType,
  DataGridChangesType,
  DataGridEventType,
  DataGridRowType,
  DataGridColumnType,
  DataGridBlockType,
  DataGridRowsType,
  DataGridColumnsType,
  DataGridBlocksType,
  DataGridSelectModeType,
  DataGridCollectionType,
  DataGridInteractionsType,
} from './types';

const buildCollection = (): DataGridCollectionType => {
  return {
    row: new Set<number>(),
    column: new Set<number>(),
    block: new Set<string>(),
  };
};

const buildInteractions = (): DataGridInteractionsType => {
  return {
    selection: buildCollection(),
    highlight: buildCollection(),
    focus: {
      row: -1,
      column: -1,
    },
  };
};

const getLastFromSet = <T>(set: Set<T>): T | undefined => {
  return Array.from(set).pop();
};

class DataGridManager {
  undoManager: UndoManager;

  dataChangeManager: DataChangeManager;

  columns: DataGridColumnsType;

  rows: DataGridRowsType;

  blocks: DataGridBlocksType;

  onUpdate?: (event: DataGridEventType) => void;

  onDirty?: (event: DataGridEventType) => void;

  selectMode: DataGridSelectModeType;

  interactions: DataGridInteractionsType;

  constructor() {
    this.undoManager = new UndoManager();
    this.dataChangeManager = new DataChangeManager();
    this.columns = new Map();
    this.rows = new Map();
    this.blocks = new Map();
    this.selectMode = 'single';
    this.interactions = buildInteractions();
  }

  size(rowCount: number, columnCount: number): void {
    const didAddRows = this.ensureAllRows(rowCount);
    const didAddColumns = this.ensureAllColumns(columnCount);
    const didAddBlocks = this.ensureAllBlocks(rowCount, columnCount);

    if (didAddRows || didAddColumns || didAddBlocks) {
      this.triggerGlobalUpdate();
    }
  }

  setRowField<T extends DataGridRowType, F extends keyof T, V extends T[F]>(
    rowIndex: number,
    field: F,
    value: V
  ): void {
    const row = this.rows.get(rowIndex);

    if (!row) {
      return;
    }

    const typedRow = row as T;
    typedRow[field] = value;

    // special case of binding data for change-tracking.
    if (field === 'data') {
      const { dataKey } = typedRow;
      this.dataChangeManager.initializeRecord(dataKey, value);
    }

    this.triggerRowEvent(typedRow, { type: 'update' });
  }

  setColumnField<
    T extends DataGridColumnType,
    F extends keyof T,
    V extends T[F]
  >(columnIndex: number, field: F, value: V): void {
    const column = this.columns.get(columnIndex);

    if (!column) {
      return;
    }

    const typedColumn = column as T;
    typedColumn[field] = value;

    this.triggerColumnEvent(typedColumn, { type: 'update' });
  }

  setBlockField<T extends DataGridBlockType, F extends keyof T, V extends T[F]>(
    rowIndex: number,
    columnIndex: number,
    field: F,
    value: V
  ): void {
    const blockKey = `${rowIndex}:${columnIndex}`;
    const block = this.blocks.get(blockKey);

    if (!block) {
      return;
    }

    const typedBlock = block as T;
    typedBlock[field] = value;

    this.triggerBlockEvent(typedBlock, { type: 'update' });
  }

  ensureAllRows(rowCount: number): boolean {
    let changed = false;
    let rowI = 0;
    while (rowI < rowCount) {
      if (this.createRowIfAbsent(rowI)) {
        changed = true;
      }
      rowI += 1;
    }
    return changed;
  }

  ensureAllColumns(columnCount: number): boolean {
    let changed = false;
    let columnI = 0;
    while (columnI < columnCount) {
      if (this.createColumnIfAbsent(columnI)) {
        changed = true;
      }
      columnI += 1;
    }
    return changed;
  }

  ensureAllBlocks(rowCount: number, columnCount: number): boolean {
    let changed = false;
    let rowI = 0;
    while (rowI < rowCount) {
      let columnI = 0;
      while (columnI < columnCount) {
        if (this.createBlockIfAbsent(rowI, columnI)) {
          changed = true;
        }
        columnI += 1;
      }
      rowI += 1;
    }
    return changed;
  }

  createRowIfAbsent(rowIndex: number): boolean {
    const row = this.rows.get(rowIndex);

    if (row) {
      return false;
    }

    const key = `tmp-${uniqueId()}`;

    this.rows.set(rowIndex, {
      highlighted: false,
      selected: false,
      // this should be overridden with a real data key
      // once you bind the row data to the row.
      dataKey: key,
      // this should be overridden with real data.
      data: {},
      key,
    });

    return true;
  }

  createColumnIfAbsent(columnIndex: number): boolean {
    const column = this.columns.get(columnIndex);

    if (column) {
      return false;
    }

    this.columns.set(columnIndex, {
      selected: false,
      visible: true,
      sorting: 0,
      highlighted: false,
      key: uniqueId(),
      field: '',
    });

    return true;
  }

  createBlockIfAbsent(rowIndex: number, columnIndex: number): boolean {
    const blockKey = `${rowIndex}:${columnIndex}`;
    const block = this.blocks.get(blockKey);

    if (block) {
      return false;
    }

    this.blocks.set(blockKey, {
      selected: false,
      highlighted: false,
      focused: false,
      editable: true,
      editing: false,
      key: uniqueId(),
    });

    return true;
  }

  appendRow(): void {
    this.createRowIfAbsent(this.rows.size);
  }

  bindGrid(onUpdate: (event: DataGridEventType) => void): void {
    this.onUpdate = onUpdate;
  }

  bindDirty(onDirty: (event: DataGridEventType) => void): void {
    this.onDirty = onDirty;
  }

  bindHeader(columnIndex: number, onUpdate: DataGridUpdateFunctionType): void {
    const column = this.columns.get(columnIndex);

    if (!column) {
      return;
    }

    column.onUpdate = onUpdate;
  }

  bindRow(rowIndex: number, onUpdate: DataGridUpdateFunctionType): void {
    const row = this.rows.get(rowIndex);

    if (!row) {
      return;
    }

    row.onUpdate = onUpdate;
  }

  bindBlock(
    rowIndex: number,
    columnIndex: number,
    onUpdate: DataGridUpdateFunctionType
  ): void {
    const block = this.blocks.get(`${rowIndex}:${columnIndex}`);

    if (!block) {
      return;
    }

    block.onUpdate = onUpdate;
  }

  unbindGrid(): void {
    this.onUpdate = undefined;
  }

  unbindDirty(): void {
    this.onDirty = undefined;
  }

  unbindHeader(columnIndex: number): void {
    const column = this.columns.get(columnIndex);

    if (!column) {
      return;
    }

    column.onUpdate = undefined;
  }

  unbindRow(rowIndex: number): void {
    const row = this.rows.get(rowIndex);

    if (!row) {
      return;
    }

    row.onUpdate = undefined;
  }

  unbindBlock(rowIndex: number, columnIndex: number): void {
    const blockKey = `${rowIndex}:${columnIndex}`;
    const block = this.blocks.get(blockKey);

    if (!block) {
      return;
    }

    block.onUpdate = undefined;
  }

  getRow(rowIndex: number): DataGridRowType | undefined {
    const row = this.rows.get(rowIndex);
    return row;
  }

  getHeader(columnIndex: number): DataGridColumnType | undefined {
    const column = this.columns.get(columnIndex);
    return column;
  }

  getBlock(
    rowIndex: number,
    columnIndex: number
  ): DataGridBlockType | undefined {
    const key = `${rowIndex}:${columnIndex}`;
    const block = this.blocks.get(key);
    return block;
  }

  getAllSelectedRows(): DataGridRowsType {
    const rows: DataGridRowsType = new Map();

    this.rows.forEach((row: DataGridRowType, key: number) => {
      if (row.selected) {
        rows.set(key, row);
      }
    });

    return rows;
  }

  getAllSelectedColumns(): DataGridColumnsType {
    const columns: DataGridColumnsType = new Map();

    this.columns.forEach((column: DataGridColumnType, key: number) => {
      if (column.selected) {
        columns.set(key, column);
      }
    });

    return columns;
  }

  getAllBlocksForRow(rowIndex: number): DataGridBlocksType {
    const blocks: DataGridBlocksType = new Map();

    this.blocks.forEach((block: DataGridBlockType, key: string) => {
      const blockRowIndex = parseInt(key.split(':')[0], 10);

      if (rowIndex === blockRowIndex) {
        blocks.set(key, block);
      }
    });

    return blocks;
  }

  getAllBlocksForColumn(columnIndex: number): DataGridBlocksType {
    const blocks: DataGridBlocksType = new Map();

    this.blocks.forEach((block: DataGridBlockType, key: string) => {
      const blockColumnIndex = parseInt(key.split(':')[1], 10);

      if (columnIndex === blockColumnIndex) {
        blocks.set(key, block);
      }
    });

    return blocks;
  }

  setSelectMode(mode: DataGridSelectModeType): void {
    this.selectMode = mode;
  }

  triggerGlobalUpdate(): void {
    this.onUpdate?.({ type: 'update' });
  }

  triggerDirty(value = true): void {
    this.onDirty?.({ type: 'update', value });
  }

  triggerRowEvent(row: DataGridRowType, event: DataGridEventType): void {
    row.onUpdate?.(event);
  }

  triggerColumnEvent(
    column: DataGridColumnType,
    event: DataGridEventType
  ): void {
    column.onUpdate?.(event);
  }

  triggerBlockEvent(block: DataGridBlockType, event: DataGridEventType): void {
    block.onUpdate?.(event);
  }

  computeCollectionRemovals(
    oldCollection: DataGridCollectionType,
    newCollection: DataGridCollectionType,
    finalCollection: DataGridCollectionType
  ): void {
    // diff the rows
    oldCollection.row.forEach(rowIndex => {
      if (!newCollection.row.has(rowIndex)) {
        finalCollection.row.add(rowIndex);
      }
    });

    // diff the columns
    oldCollection.column.forEach(columnIndex => {
      if (!newCollection.column.has(columnIndex)) {
        finalCollection.column.add(columnIndex);
      }
    });

    // diff the blocks
    oldCollection.block.forEach(blockKey => {
      if (!newCollection.block.has(blockKey)) {
        finalCollection.block.add(blockKey);
      }
    });
  }

  computeCollectionAdditions(
    oldCollection: DataGridCollectionType,
    newCollection: DataGridCollectionType,
    finalCollection: DataGridCollectionType
  ): void {
    // diff the rows
    newCollection.row.forEach(rowIndex => {
      if (!oldCollection.row.has(rowIndex)) {
        finalCollection.row.add(rowIndex);
      }
    });

    // diff the columns
    newCollection.column.forEach(columnIndex => {
      if (!oldCollection.column.has(columnIndex)) {
        finalCollection.column.add(columnIndex);
      }
    });

    // diff the blocks
    newCollection.block.forEach(blockKey => {
      if (!oldCollection.block.has(blockKey)) {
        finalCollection.block.add(blockKey);
      }
    });
  }

  computeInteractionAdditions(
    newInteractions: DataGridInteractionsType
  ): DataGridInteractionsType {
    // diff the interactions
    // finalInteractionAdditions = newInteractions - oldInteractions
    const oldInteractions = this.interactions;
    const finalInteractionAdditions = buildInteractions();

    // diff the selection
    this.computeCollectionAdditions(
      oldInteractions.selection,
      newInteractions.selection,
      finalInteractionAdditions.selection
    );

    // diff the highlight
    this.computeCollectionAdditions(
      oldInteractions.highlight,
      newInteractions.highlight,
      finalInteractionAdditions.highlight
    );

    // diff the focus
    finalInteractionAdditions.focus.row = newInteractions.focus.row;
    finalInteractionAdditions.focus.column = newInteractions.focus.column;

    return finalInteractionAdditions;
  }

  computeInteractionRemovals(
    newInteractions: DataGridInteractionsType
  ): DataGridInteractionsType {
    // diff the interactions
    // finalInteractionRemovals = oldInteractions - newInteractions
    const oldInteractions = this.interactions;
    const finalInteractionRemovals = buildInteractions();

    // diff the selection
    this.computeCollectionRemovals(
      oldInteractions.selection,
      newInteractions.selection,
      finalInteractionRemovals.selection
    );

    // diff the highlight
    this.computeCollectionRemovals(
      oldInteractions.highlight,
      newInteractions.highlight,
      finalInteractionRemovals.highlight
    );

    // diff the focus
    finalInteractionRemovals.focus.row = oldInteractions.focus.row;
    finalInteractionRemovals.focus.column = oldInteractions.focus.column;

    return finalInteractionRemovals;
  }

  applyInteractionRemovals(
    interactionRemovals: DataGridInteractionsType
  ): void {
    this.applyDefocus(interactionRemovals.focus);
    this.applyDeselect(interactionRemovals.selection);
    this.applyDehighlight(interactionRemovals.highlight);
  }

  applyInteractionAdditions(
    interactionAdditions: DataGridInteractionsType
  ): void {
    this.applyHighlight(interactionAdditions.highlight);
    this.applySelect(interactionAdditions.selection);
    this.applyFocus(interactionAdditions.focus);
  }

  applyDefocus(focusRemoval: DataGridBlockPositionType): void {
    const blockKey = `${focusRemoval.row}:${focusRemoval.column}`;
    const block = this.blocks.get(blockKey);

    if (!block) {
      return;
    }

    const { interactions } = this;

    interactions.focus.row = -1;
    interactions.focus.column = -1;

    block.focused = false;

    this.triggerBlockEvent(block, { type: 'update' });
  }

  applyDeselect(selectionRemovals: DataGridCollectionType): void {
    const self = this;
    const oldSelection = this.interactions.selection;

    // deselect rows
    selectionRemovals.row.forEach(rowIndex => {
      oldSelection.row.delete(rowIndex);

      const row = self.rows.get(rowIndex);

      if (!row) {
        return;
      }

      row.selected = false;

      self.triggerRowEvent(row, { type: 'update' });
    });

    // deselect columns
    selectionRemovals.column.forEach(columnIndex => {
      oldSelection.column.delete(columnIndex);

      const column = self.columns.get(columnIndex);

      if (!column) {
        return;
      }

      column.selected = false;

      self.triggerColumnEvent(column, { type: 'update' });
    });

    // deselect blocks
    selectionRemovals.block.forEach(blockKey => {
      oldSelection.block.delete(blockKey);

      const block = self.blocks.get(blockKey);

      if (!block) {
        return;
      }

      block.selected = false;

      self.triggerBlockEvent(block, { type: 'update' });
    });
  }

  applyDehighlight(highlightRemovals: DataGridCollectionType): void {
    const self = this;
    const oldHighlight = this.interactions.highlight;

    // dehighlight rows
    highlightRemovals.row.forEach(rowIndex => {
      oldHighlight.row.delete(rowIndex);

      const row = self.rows.get(rowIndex);

      if (!row) {
        return;
      }

      row.highlighted = false;

      self.triggerRowEvent(row, { type: 'update' });
    });

    // dehighlight columns
    highlightRemovals.column.forEach(columnIndex => {
      oldHighlight.column.delete(columnIndex);

      const column = self.columns.get(columnIndex);

      if (!column) {
        return;
      }

      column.highlighted = false;

      self.triggerColumnEvent(column, { type: 'update' });
    });

    // dehighlight blocks
    highlightRemovals.block.forEach(blockIndex => {
      oldHighlight.block.delete(blockIndex);

      const block = self.blocks.get(blockIndex);

      if (!block) {
        return;
      }

      block.highlighted = false;

      self.triggerBlockEvent(block, { type: 'update' });
    });
  }

  applyFocus(focusAddition: DataGridBlockPositionType): void {
    const blockKey = `${focusAddition.row}:${focusAddition.column}`;
    const block = this.blocks.get(blockKey);

    if (!block) {
      return;
    }

    const { interactions } = this;

    interactions.focus.row = focusAddition.row;
    interactions.focus.column = focusAddition.column;

    if (block.focused) {
      return;
    }

    block.focused = true;

    this.triggerBlockEvent(block, { type: 'update' });
  }

  applySelect(selectionAdditions: DataGridCollectionType): void {
    const self = this;
    const { selection } = this.interactions;

    // select rows
    selectionAdditions.row.forEach(rowIndex => {
      selection.row.add(rowIndex);

      const row = self.rows.get(rowIndex);

      if (!row) {
        return;
      }

      row.selected = true;

      self.triggerRowEvent(row, { type: 'update' });
    });

    // select columns
    selectionAdditions.column.forEach(columnIndex => {
      selection.column.add(columnIndex);

      const column = self.columns.get(columnIndex);

      if (!column) {
        return;
      }

      column.selected = true;

      self.triggerColumnEvent(column, { type: 'update' });
    });

    // select blocks
    selectionAdditions.block.forEach(blockIndex => {
      selection.block.add(blockIndex);

      const block = self.blocks.get(blockIndex);

      if (!block) {
        return;
      }

      block.selected = true;

      self.triggerBlockEvent(block, { type: 'update' });
    });
  }

  applyHighlight(highlightAdditions: DataGridCollectionType): void {
    const self = this;
    const { highlight } = this.interactions;

    // highlight rows
    highlightAdditions.row.forEach(rowIndex => {
      highlight.row.add(rowIndex);

      const row = self.rows.get(rowIndex);

      if (!row) {
        return;
      }

      row.highlighted = true;

      self.triggerRowEvent(row, { type: 'update' });
    });

    // highlight columns
    highlightAdditions.column.forEach(columnIndex => {
      highlight.column.add(columnIndex);

      const column = self.columns.get(columnIndex);

      if (!column) {
        return;
      }

      column.highlighted = true;

      self.triggerColumnEvent(column, { type: 'update' });
    });

    // highlight blocks
    highlightAdditions.block.forEach(blockIndex => {
      highlight.block.add(blockIndex);

      const block = self.blocks.get(blockIndex);

      if (!block) {
        return;
      }

      block.highlighted = true;

      self.triggerBlockEvent(block, { type: 'update' });
    });
  }

  sortColumn(columnIndex: number, sorting: number): void {
    const column = this.columns.get(columnIndex);

    if (!column) {
      return;
    }

    column.sorting = sorting;

    this.triggerGlobalUpdate();
  }

  deselect(): void {
    this.editBlockExit();
    this.applyInteractionRemovals(this.interactions);
  }

  selectRow(rowIndex: number): void {
    switch (this.selectMode) {
      case 'multiple':
        this.selectRowMultipleMode(rowIndex);
        break;
      case 'range':
        this.selectRowRangeMode(rowIndex);
        break;
      default:
        this.selectRowSingleMode(rowIndex);
        break;
    }
  }

  selectRowSingleMode(rowIndex: number): void {
    const row = this.rows.get(rowIndex);

    if (!row) {
      return;
    }

    const newInteractions = buildInteractions();
    newInteractions.selection.row.add(rowIndex);

    this.highlightAllBlocksInRow(rowIndex, newInteractions);
    this.highlightAllColumns(newInteractions);
    this.focusFirstBlockInRow(rowIndex, newInteractions);

    // compute the diff of what states should be removed, and which added
    const finalInteractionRemovals =
      this.computeInteractionRemovals(newInteractions);
    const finalInteractionAdditions =
      this.computeInteractionAdditions(newInteractions);

    // trigger rerendering
    this.applyInteractionRemovals(finalInteractionRemovals);
    this.applyInteractionAdditions(finalInteractionAdditions);
  }

  selectRowMultipleMode(rowIndex: number): void {
    const row = this.rows.get(rowIndex);

    if (!row) {
      return;
    }

    const newInteractions = buildInteractions();
    newInteractions.selection.row.add(rowIndex);

    this.highlightAllBlocksInRow(rowIndex, newInteractions);
    this.highlightAllColumns(newInteractions);
    this.focusFirstBlockInRow(rowIndex, newInteractions);

    // compute the diff of what states should be removed, and which added
    const finalInteractionAdditions =
      this.computeInteractionAdditions(newInteractions);

    // trigger rerendering
    this.applyInteractionAdditions(finalInteractionAdditions);
  }

  selectRowRangeMode(rowIndex: number): void {
    const row = this.rows.get(rowIndex);

    if (!row) {
      return;
    }

    const newInteractions = buildInteractions();

    this.highlightAllColumns(newInteractions);

    const { selection } = this.interactions;
    const firstSelectedRowIndex = selection.row.values().next()?.value;

    let startIndex = -1;
    let endIndex = -1;

    if (firstSelectedRowIndex) {
      if (firstSelectedRowIndex > rowIndex) {
        // we selected a row above of the first row we selected
        startIndex = rowIndex;
        endIndex = firstSelectedRowIndex;
      } else {
        // we selected to below the first row selected
        startIndex = firstSelectedRowIndex;
        endIndex = rowIndex;
      }
    } else {
      startIndex = rowIndex;
      endIndex = rowIndex;
    }

    // we selected the first row even though in range mode
    if (startIndex === endIndex) {
      this.focusFirstBlockInRow(startIndex, newInteractions);
    }

    // all rows within range (and their blocks) should be selected
    while (startIndex <= endIndex) {
      newInteractions.selection.row.add(startIndex);
      this.highlightAllBlocksInRow(startIndex, newInteractions);

      startIndex += 1;
    }

    // compute the diff of what states should be removed, and which added
    const finalInteractionRemovals =
      this.computeInteractionRemovals(newInteractions);
    const finalInteractionAdditions =
      this.computeInteractionAdditions(newInteractions);

    // trigger rerendering
    this.applyInteractionRemovals(finalInteractionRemovals);
    this.applyInteractionAdditions(finalInteractionAdditions);
  }

  selectColumn(columnIndex: number): void {
    switch (this.selectMode) {
      case 'multiple':
        this.selectColumnMultipleMode(columnIndex);
        break;
      case 'range':
        this.selectColumnRangeMode(columnIndex);
        break;
      default:
        this.selectColumnSingleMode(columnIndex);
        break;
    }
  }

  selectColumnSingleMode(columnIndex: number): void {
    const column = this.columns.get(columnIndex);

    if (!column) {
      return;
    }

    const newInteractions = buildInteractions();
    newInteractions.selection.column.add(columnIndex);

    this.highlightAllBlocksInColumn(columnIndex, newInteractions);
    this.highlightAllRows(newInteractions);
    this.focusFirstBlockInColumn(columnIndex, newInteractions);

    // compute the diff of what states should be removed, and which added
    const finalInteractionRemovals =
      this.computeInteractionRemovals(newInteractions);
    const finalInteractionAdditions =
      this.computeInteractionAdditions(newInteractions);

    // trigger rerendering
    this.applyInteractionRemovals(finalInteractionRemovals);
    this.applyInteractionAdditions(finalInteractionAdditions);
  }

  selectColumnMultipleMode(columnIndex: number): void {
    const column = this.columns.get(columnIndex);

    if (!column) {
      return;
    }

    // doesn't trigger deselect on anything
    const newInteractions = buildInteractions();
    newInteractions.selection.column.add(columnIndex);

    // copy most of the existing interactions.
    const { interactions } = this;
    interactions.highlight.row.forEach((_, key) => {
      newInteractions.highlight.row.add(key);
    });
    interactions.highlight.column.forEach((_, key) => {
      newInteractions.highlight.column.add(key);
    });
    interactions.highlight.block.forEach((_, key) => {
      newInteractions.highlight.block.add(key);
    });
    interactions.selection.row.forEach((_, key) => {
      newInteractions.selection.row.add(key);
    });
    interactions.selection.column.forEach((_, key) => {
      newInteractions.selection.column.add(key);
    });
    interactions.selection.block.forEach((_, key) => {
      newInteractions.selection.block.add(key);
    });

    this.highlightAllBlocksInColumn(columnIndex, newInteractions);
    this.highlightAllRows(newInteractions);
    this.focusFirstBlockInColumn(columnIndex, newInteractions);

    const finalInteractionRemovals =
      this.computeInteractionRemovals(newInteractions);
    const finalInteractionAdditions =
      this.computeInteractionAdditions(newInteractions);

    // trigger rerendering
    this.applyInteractionRemovals(finalInteractionRemovals);
    this.applyInteractionAdditions(finalInteractionAdditions);
  }

  selectColumnRangeMode(columnIndex: number): void {
    const column = this.columns.get(columnIndex);

    if (!column) {
      return;
    }

    // only triggers deselect on rows
    const newInteractions = buildInteractions();
    this.highlightAllRows(newInteractions);

    const focusedBlockPosition = this.interactions.focus;

    let startIndex = -1;
    let endIndex = -1;

    if (focusedBlockPosition.column !== -1) {
      if (focusedBlockPosition.column > columnIndex) {
        // we selected a column to the left of the first column we selected
        startIndex = columnIndex;
        endIndex = focusedBlockPosition.column;
      } else {
        // we selected to the right
        startIndex = focusedBlockPosition.column;
        endIndex = columnIndex;
      }
    } else {
      startIndex = columnIndex;
      endIndex = columnIndex;
    }

    // we selected the first column even though in range mode
    if (startIndex === endIndex) {
      this.focusFirstBlockInColumn(startIndex, newInteractions);
    } else {
      this.focusBlock(
        focusedBlockPosition.row,
        focusedBlockPosition.column,
        newInteractions
      );
    }

    // all columns within range (and their blocks) should be selected
    while (startIndex <= endIndex) {
      newInteractions.selection.column.add(startIndex);
      this.highlightAllBlocksInColumn(startIndex, newInteractions);

      startIndex += 1;
    }

    // compute the diff of what states should be removed, and which added
    const finalInteractionRemovals =
      this.computeInteractionRemovals(newInteractions);
    const finalInteractionAdditions =
      this.computeInteractionAdditions(newInteractions);

    // trigger rerendering
    this.applyInteractionRemovals(finalInteractionRemovals);
    this.applyInteractionAdditions(finalInteractionAdditions);
  }

  selectBlock(rowIndex: number, columnIndex: number): void {
    switch (this.selectMode) {
      case 'multiple':
        this.selectBlockMultipleMode(rowIndex, columnIndex);
        break;
      case 'range':
        this.selectBlockRangeMode(rowIndex, columnIndex);
        break;
      default:
        this.selectBlockSingleMode(rowIndex, columnIndex);
        break;
    }
  }

  selectBlockSingleMode(rowIndex: number, columnIndex: number): void {
    const blockKey = `${rowIndex}:${columnIndex}`;
    const block = this.blocks.get(blockKey);

    if (!block) {
      return;
    }

    const newInteractions = buildInteractions();
    newInteractions.selection.block.add(blockKey);

    this.highlightRow(rowIndex, newInteractions);
    this.highlightColumn(columnIndex, newInteractions);
    this.highlightBlock(rowIndex, columnIndex, newInteractions);
    this.focusBlock(rowIndex, columnIndex, newInteractions);

    // compute the diff of what states should be removed, and which added
    const finalInteractionRemovals =
      this.computeInteractionRemovals(newInteractions);
    const finalInteractionAdditions =
      this.computeInteractionAdditions(newInteractions);

    // trigger rerendering
    this.applyInteractionRemovals(finalInteractionRemovals);
    this.applyInteractionAdditions(finalInteractionAdditions);
  }

  selectBlockMultipleMode(rowIndex: number, columnIndex: number): void {
    const blockKey = `${rowIndex}:${columnIndex}`;
    const block = this.blocks.get(blockKey);

    if (!block) {
      return;
    }

    const newInteractions = buildInteractions();
    newInteractions.selection.block.add(blockKey);

    // copy most of the existing interactions.
    const { interactions } = this;
    interactions.highlight.row.forEach((_, key) => {
      newInteractions.highlight.row.add(key);
    });
    interactions.highlight.column.forEach((_, key) => {
      newInteractions.highlight.column.add(key);
    });
    interactions.highlight.block.forEach((_, key) => {
      newInteractions.highlight.block.add(key);
    });
    interactions.selection.row.forEach((_, key) => {
      newInteractions.selection.row.add(key);
    });
    interactions.selection.column.forEach((_, key) => {
      newInteractions.selection.column.add(key);
    });
    interactions.selection.block.forEach((_, key) => {
      newInteractions.selection.block.add(key);
    });

    this.highlightRow(rowIndex, newInteractions);
    this.highlightColumn(columnIndex, newInteractions);
    this.highlightBlock(rowIndex, columnIndex, newInteractions);
    this.focusBlock(rowIndex, columnIndex, newInteractions);

    // compute the diff of what states should be removed, and which added
    const finalInteractionRemovals =
      this.computeInteractionRemovals(newInteractions);
    const finalInteractionAdditions =
      this.computeInteractionAdditions(newInteractions);

    // trigger rerendering
    this.applyInteractionRemovals(finalInteractionRemovals);
    this.applyInteractionAdditions(finalInteractionAdditions);
  }

  selectBlockRangeMode(rowIndex: number, columnIndex: number): void {
    const blockKey = `${rowIndex}:${columnIndex}`;
    const block = this.blocks.get(blockKey);

    if (!block) {
      return;
    }

    const newInteractions = buildInteractions();
    const focusedBlockPosition = this.interactions.focus;

    // compute the bounding box for highlighted blocks
    const start = { row: -1, column: -1 };
    const end = { row: -1, column: -1 };

    if (focusedBlockPosition.row === -1) {
      // we didn't previously select anything in this case
      start.row = rowIndex;
      end.row = rowIndex;
      start.column = columnIndex;
      end.column = columnIndex;

      // since we didn't previously focus, do so now
      this.focusBlock(rowIndex, columnIndex, newInteractions);
    } else {
      // keep focus where it was for next time
      this.focusBlock(
        focusedBlockPosition.row,
        focusedBlockPosition.column,
        newInteractions
      );

      if (focusedBlockPosition.row <= rowIndex) {
        start.row = focusedBlockPosition.row;
        end.row = rowIndex;
      } else {
        start.row = rowIndex;
        end.row = focusedBlockPosition.row;
      }

      if (focusedBlockPosition.column <= columnIndex) {
        start.column = focusedBlockPosition.column;
        end.column = columnIndex;
      } else {
        start.column = columnIndex;
        end.column = focusedBlockPosition.column;
      }
    }

    // highlight all the blocks and associated rows and columns
    let rowI = start.row;
    while (rowI <= end.row) {
      this.highlightRow(rowI, newInteractions);

      let columnI = start.column;

      while (columnI <= end.column) {
        this.highlightColumn(columnI, newInteractions);

        this.highlightBlock(rowI, columnI, newInteractions);

        columnI += 1;
      }

      rowI += 1;
    }

    // compute the diff of what states should be removed, and which added
    const finalInteractionRemovals =
      this.computeInteractionRemovals(newInteractions);
    const finalInteractionAdditions =
      this.computeInteractionAdditions(newInteractions);

    // trigger rerendering
    this.applyInteractionRemovals(finalInteractionRemovals);
    this.applyInteractionAdditions(finalInteractionAdditions);
  }

  highlightRow(
    rowIndex: number,
    newInteractions: DataGridInteractionsType
  ): void {
    const row = this.rows.get(rowIndex);

    if (!row) {
      return;
    }

    newInteractions.highlight.row.add(rowIndex);
  }

  highlightColumn(
    columnIndex: number,
    newInteractions: DataGridInteractionsType
  ): void {
    const column = this.columns.get(columnIndex);

    if (!column) {
      return;
    }

    newInteractions.highlight.column.add(columnIndex);
  }

  highlightBlock(
    rowIndex: number,
    columnIndex: number,
    newInteractions: DataGridInteractionsType
  ): void {
    const blockKey = `${rowIndex}:${columnIndex}`;
    const block = this.blocks.get(blockKey);

    if (!block) {
      return;
    }

    newInteractions.highlight.block.add(blockKey);
  }

  focusBlock(
    rowIndex: number,
    columnIndex: number,
    newInteractions: DataGridInteractionsType
  ): void {
    const blockKey = `${rowIndex}:${columnIndex}`;
    const block = this.blocks.get(blockKey);

    if (!block) {
      return;
    }

    newInteractions.focus.row = rowIndex;
    newInteractions.focus.column = columnIndex;
  }

  highlightAllBlocksInRow(
    rowIndex: number,
    newInteractions: DataGridInteractionsType
  ): void {
    const blocks = this.getAllBlocksForRow(rowIndex);

    // highlight all the blocks in the row
    blocks.forEach((_, key) => newInteractions.highlight.block.add(key));
  }

  highlightAllBlocksInColumn(
    columnIndex: number,
    newInteractions: DataGridInteractionsType
  ): void {
    const blocks = this.getAllBlocksForColumn(columnIndex);

    // highlight all the blocks in the column
    blocks.forEach((_, key) => newInteractions.highlight.block.add(key));
  }

  highlightAllRows(newInteractions: DataGridInteractionsType): void {
    this.rows.forEach((_, rowIndex) =>
      newInteractions.highlight.row.add(rowIndex)
    );
  }

  highlightAllColumns(newInteractions: DataGridInteractionsType): void {
    this.columns.forEach((_, columnIndex) =>
      newInteractions.highlight.column.add(columnIndex)
    );
  }

  focusFirstBlockInRow(
    rowIndex: number,
    newInteractions: DataGridInteractionsType
  ): void {
    // select the first block
    const firstBlockKey = `${rowIndex}:${0}`;
    const firstBlock = this.blocks.get(firstBlockKey);

    if (firstBlock) {
      newInteractions.selection.block.add(firstBlockKey);
      newInteractions.focus.row = rowIndex;
      newInteractions.focus.column = 0;
    }
  }

  focusFirstBlockInColumn(
    columnIndex: number,
    newInteractions: DataGridInteractionsType
  ): void {
    // select the first block
    const firstBlockKey = `${0}:${columnIndex}`;
    const firstBlock = this.blocks.get(firstBlockKey);

    if (firstBlock) {
      newInteractions.selection.block.add(firstBlockKey);
      newInteractions.focus.row = 0;
      newInteractions.focus.column = columnIndex;
    }
  }

  createTransaction(): DataGridTransaction {
    return new DataGridTransaction();
  }

  commitTransaction(transaction: DataGridTransaction): void {
    const { blocks } = this;
    const undoChanges: DataGridChangesType = new Map();
    const redoChanges = transaction.changes;

    transaction.changes.forEach((_: unknown, key: string) => {
      const block = blocks.get(key);

      if (!block) {
        return;
      }

      const oldValue = block.data;
      undoChanges.set(key, oldValue);
    });

    const self = this;

    this.undoManager.add({
      undo() {
        self.applyBlockDataChanges(undoChanges);
      },
      redo() {
        self.applyBlockDataChanges(redoChanges);
      },
    });

    this.applyBlockDataChanges(redoChanges);
  }

  applyBlockDataChanges(changes: DataGridChangesType): void {
    const { rows, columns, blocks, dataChangeManager } = this;
    const updatedBlocks: Array<DataGridBlockType> = [];

    // sync to the data model first, so if read it gets the latest value.
    changes.forEach((newValue: unknown, key: string) => {
      const [rowIndex, columnIndex] = key
        .split(':')
        .map(part => parseInt(part, 10));
      const row = rows.get(rowIndex);
      const column = columns.get(columnIndex);
      const block = blocks.get(key);

      if (!row || !column || !block) {
        return;
      }

      dataChangeManager.setRecordField(row.dataKey, column.field, newValue);

      block.data = newValue;

      updatedBlocks.push(block);
    });

    const self = this;

    // then update the UI.
    updatedBlocks.forEach(block => {
      self.triggerBlockEvent(block, { type: 'update' });
    });

    // due to the dirty tracking...
    this.triggerDirty(dataChangeManager.isDirty());
  }

  editBlockEnter(): void {
    const { focus } = this.interactions;

    if (focus.row === -1) {
      return;
    }

    const blockKey = `${focus.row}:${focus.column}`;
    const block = this.blocks.get(blockKey);

    if (!block) {
      return;
    }

    if (!block.editable) {
      return;
    }

    block.editing = true;

    this.triggerBlockEvent(block, { type: 'update' });
  }

  editBlockExit(): void {
    const { focus } = this.interactions;

    if (focus.row === -1) {
      return;
    }

    const blockKey = `${focus.row}:${focus.column}`;
    const block = this.blocks.get(blockKey);

    if (!block) {
      return;
    }

    if (!block.editable) {
      return;
    }

    block.editing = false;

    this.triggerBlockEvent(block, { type: 'update' });
  }

  isEditing(): boolean {
    const { focus } = this.interactions;

    if (focus.row === -1) {
      return false;
    }

    const blockKey = `${focus.row}:${focus.column}`;
    const block = this.blocks.get(blockKey);

    if (!block) {
      return false;
    }

    return block.editing;
  }

  navigateLeft(): void {
    switch (this.selectMode) {
      case 'multiple':
        break;
      case 'range':
        this.navigateLeftRangeMode();
        break;
      default:
        this.navigateLeftSingleMode();
        break;
    }
  }

  navigateLeftSingleMode(): void {
    const { focus } = this.interactions;

    if (focus.row === -1) {
      return;
    }

    const oldFocus = this.interactions.focus;
    const newFocus = {
      row: oldFocus.row,
      column: Math.max(0, oldFocus.column - 1),
    };

    this.selectBlock(newFocus.row, newFocus.column);
  }

  navigateLeftRangeMode(): void {
    const { highlight } = this.interactions;

    const lastRowSelectionIndex = getLastFromSet(highlight.row);
    const lastColumnSelectionIndex = getLastFromSet(highlight.column);

    // have to check for existence due to the nature of getLastFromSet
    if (lastRowSelectionIndex == null || lastColumnSelectionIndex == null) {
      return;
    }

    const nextColumnIndex = Math.max(0, lastColumnSelectionIndex - 1);
    this.selectBlock(lastRowSelectionIndex, nextColumnIndex);
  }

  navigateRight(): void {
    switch (this.selectMode) {
      case 'multiple':
        break;
      case 'range':
        this.navigateRightRangeMode();
        break;
      default:
        this.navigateRightSingleMode();
        break;
    }
  }

  navigateRightSingleMode(): void {
    const { focus } = this.interactions;

    if (focus.row === -1) {
      return;
    }

    const oldFocus = this.interactions.focus;
    const newFocus = {
      row: oldFocus.row,
      column: Math.min(oldFocus.column + 1, this.columns.size - 1),
    };

    this.selectBlock(newFocus.row, newFocus.column);
  }

  navigateRightRangeMode(): void {
    const { highlight } = this.interactions;

    const lastRowSelectionIndex = getLastFromSet(highlight.row);
    const lastColumnSelectionIndex = getLastFromSet(highlight.column);

    // have to check for existence due to the nature of getLastFromSet
    if (lastRowSelectionIndex == null || lastColumnSelectionIndex == null) {
      return;
    }

    const nextColumnIndex = Math.min(
      lastColumnSelectionIndex + 1,
      this.columns.size - 1
    );
    this.selectBlock(lastRowSelectionIndex, nextColumnIndex);
  }

  navigateUp(): void {
    switch (this.selectMode) {
      case 'multiple':
        break;
      case 'range':
        this.navigateUpRangeMode();
        break;
      default:
        this.navigateUpSingleMode();
        break;
    }
  }

  navigateUpSingleMode(): void {
    const { focus } = this.interactions;

    if (focus.row === -1) {
      return;
    }

    const oldFocus = this.interactions.focus;
    const newFocus = {
      row: Math.max(0, oldFocus.row - 1),
      column: oldFocus.column,
    };

    this.selectBlock(newFocus.row, newFocus.column);
  }

  navigateUpRangeMode(): void {
    const { highlight } = this.interactions;

    const lastRowSelectionIndex = getLastFromSet(highlight.row);
    const lastColumnSelectionIndex = getLastFromSet(highlight.column);

    // have to check for existence due to the nature of getLastFromSet
    if (lastRowSelectionIndex == null || lastColumnSelectionIndex == null) {
      return;
    }

    const nextRowIndex = Math.max(0, lastRowSelectionIndex - 1);
    this.selectBlock(nextRowIndex, lastColumnSelectionIndex);
  }

  navigateDown(): void {
    switch (this.selectMode) {
      case 'multiple':
        break;
      case 'range':
        this.navigateDownRangeMode();
        break;
      default:
        this.navigateDownSingleMode();
        break;
    }
  }

  navigateDownSingleMode(): void {
    const { focus } = this.interactions;

    if (focus.row === -1) {
      return;
    }

    const oldFocus = this.interactions.focus;
    const newFocus = {
      row: Math.min(oldFocus.row + 1, this.rows.size - 1),
      column: oldFocus.column,
    };

    this.selectBlock(newFocus.row, newFocus.column);
  }

  navigateDownRangeMode(): void {
    const { highlight } = this.interactions;

    const lastRowSelectionIndex = getLastFromSet(highlight.row);
    const lastColumnSelectionIndex = getLastFromSet(highlight.column);

    // have to check for existence due to the nature of getLastFromSet
    if (lastRowSelectionIndex == null || lastColumnSelectionIndex == null) {
      return;
    }

    const nextRowIndex = Math.min(
      lastRowSelectionIndex + 1,
      this.rows.size - 1
    );
    this.selectBlock(nextRowIndex, lastColumnSelectionIndex);
  }

  loadSpreadsheetText(text: string): void {
    const transaction = this.createTransaction();
    const self = this;
    const columns: Array<DataGridColumnType> = [];

    this.columns.forEach((column: DataGridColumnType) => {
      if (column.visible) {
        columns.push(column);
      }
    });

    // if the grid can accept paste events but nothing is selected,
    // then paste it in the top-left corner of the sheet.
    if (this.interactions.focus.row === -1) {
      this.selectBlock(0, 0);
    }

    const { focus } = this.interactions;

    const newRows: Array<number> = [];

    text
      .trim()
      .split('\n')
      .forEach((line, i) => {
        const rowIndex = focus.row + i;
        newRows.push(rowIndex);
        line
          .trim()
          .split('\t')
          .forEach((string, vi) => {
            const columnIndex = focus.column + vi;
            const column = columns[columnIndex];
            if (!column) {
              return;
            }

            if (!column.deserializer) {
              return;
            }

            // only if we know how to deserialize it will it work

            const data = column.deserializer(string);
            transaction.setBlockData(rowIndex, columnIndex, data);
          });
      });

    newRows.forEach(rowIndex => {
      self.createRowIfAbsent(rowIndex);
    });

    this.commitTransaction(transaction);
  }

  deleteHighlights(): void {
    const self = this;
    const transaction = this.createTransaction();

    this.interactions.highlight.block.forEach(key => {
      const block = self.blocks.get(key);

      if (!block) {
        return;
      }

      const [rowIndex, columnIndex] = key
        .split(':')
        .map(part => parseInt(part, 10));

      transaction.setBlockData(rowIndex, columnIndex, undefined);
    });

    this.commitTransaction(transaction);
  }

  captureHighlightedText(): string {
    const self = this;
    const capturedRows = new Map<number, Map<number, string>>();

    this.interactions.highlight.block.forEach(key => {
      const block = self.blocks.get(key);

      if (!block) {
        return;
      }

      const [rowIndex, columnIndex] = key
        .split(':')
        .map(part => parseInt(part, 10));

      const row = self.rows.get(rowIndex);

      if (!row) {
        return;
      }

      const column = self.columns.get(columnIndex);

      if (!column) {
        return;
      }

      if (!capturedRows.get(rowIndex)) {
        capturedRows.set(rowIndex, new Map<number, string>());
      }

      const capturedBlocks = capturedRows.get(rowIndex);

      // it's here, but again, typescript.
      if (!capturedBlocks) {
        return;
      }

      const value = column.loader ? column.loader(row.data) : undefined;
      const string = column.serializer ? column.serializer(value) : '';
      capturedBlocks.set(columnIndex, string);
    });

    const lines: Array<string> = [];

    capturedRows.forEach(capturedBlocks => {
      const line: Array<string> = [];

      capturedBlocks.forEach(string => {
        line.push(`${string}\t`);
      });

      lines.push(line.join(''));
    });

    const text = lines.join('\n');

    return text;
  }

  cutHighlightedText(): string {
    const text = this.captureHighlightedText();

    // now that we have the text, we can actually delete it.
    this.deleteHighlights();

    return text;
  }

  copyHighlightedText(): string {
    const text = this.captureHighlightedText();
    return text;
  }

  undo(): void {
    this.undoManager.undo();
  }

  redo(): void {
    this.undoManager.redo();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exportChanges(): Record<string, any> {
    return this.dataChangeManager.toJSON();
  }

  clearChanges(): void {
    this.dataChangeManager.clear();
    this.triggerDirty(false);
  }
}

export default DataGridManager;
