export type DataGridUpdateFunctionType = (event: DataGridEventType) => void;

export type DataGridBlockPositionType = {
  row: number;
  column: number;
};

export type DataGridChangesType = Map<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataGridEventType<T = any> = {
  type: string;
  value?: T;
};

export type DataGridRowType = {
  dataKey: string;
  data: Record<string, unknown>;
  // unique key that's ideally not the index of the row
  key: string;
  // if at least a cell is selected
  highlighted: boolean;
  // if the row was clicked at some point and selected
  selected: boolean;
  // update the row with events
  onUpdate?: DataGridUpdateFunctionType;
};

export type DataGridColumnType = {
  data?: unknown;
  // unique key that's ideally not the index of the column
  key: string;
  // the field read from the row data object.
  field: string;
  // if we hide/show this column
  visible: boolean;
  // -1 (descending), 0 (none), or 1 (ascending)
  sorting: number;
  // if at least a cell is selected
  highlighted: boolean;
  // if the column was clicked at some point and selected
  selected: boolean;
  // update the column with events
  onUpdate?: DataGridUpdateFunctionType;
  // loader to load data from `data`
  // fetching the property from the record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loader?: (record: any) => any;
  // convert text (such as from copy/paste) to the primitive or object structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deserializer?: (text: string) => any;
  // convert the data structure to a string for copying
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serializer?: (data: any) => string;
};

export type DataGridBlockType = {
  key: string;
  data?: unknown;
  highlighted: boolean;
  focused: boolean;
  selected: boolean;
  // if the block is editable
  editable: boolean;
  // if we have entered into the cell and we are in edit mode
  editing: boolean;
  onUpdate?: DataGridUpdateFunctionType;
};

export type DataGridRowsType = Map<number, DataGridRowType>;
export type DataGridColumnsType = Map<number, DataGridColumnType>;
export type DataGridBlocksType = Map<string, DataGridBlockType>;

export type DataGridSelectModeType = 'single' | 'multiple' | 'range';

export type DataGridCollectionType = {
  row: Set<number>;
  column: Set<number>;
  block: Set<string>;
};

export type DataGridInteractionsType = {
  selection: DataGridCollectionType;
  highlight: DataGridCollectionType;
  focus: DataGridBlockPositionType;
};
