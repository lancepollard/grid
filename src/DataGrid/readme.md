# DataGrid Component

This `DataGrid` component is composed of a `DataGridManager` and a small set of _headless_ components. The goal is for this component/folder to reach a "fixed point" where it never needs to change or need updating. That is, it will have all functionality required, and never need to be updated. The updating and customization occurs in the `ConfiguredDataGrid`, which is where we create the "headed UI", on top of the main `DataGrid` component. Once we have designed a "headed" UI in the `ConfiguredDataGrid`, that is what we use throughout the app in the various places. It will provide a unified design and suite of custom blocks to handle all our design and functionality requirements.

**Again, pretty much all of this you DO NOT need to know, as it has already been implemented in `ConfiguredDataGrid`. This is just here for completeness, just in case you need to dig in.**

## API

These are the methods, components, properties, and hooks to be aware of when implementing the `DataGrid`. We have _already implemented_ the `DataGrid` in the `ConfiguredDataGrid` folder, so for this app it shouldn't need to be done again! But for sake of completeness, in case something in the underlying/central `DataGrid` itself needs to be changed or fiddled with (ideally not!), here is what you'll need to know.

### `useDataGrid`

```js
import { useDataGrid } from '@components/DataGrid';
```

All this does is instantiate a `DataGridManager` into a variable we call `grid`, and cache the result. This `grid` is used to manage all the datagrid state (like which cells are selected, etc.).

Use this to instantiate a `<DataGrid grid={grid}>...</DataGrid>`.

You also want to configure/setup the rows/columns/blocks for the datagrid when your GraphQL (or other) data is loaded.

### `grid.setRowField`

This initializes the row at an index.

### `grid.setColumnField`

This initializes the header/column at an index.

### `grid.setBlockField`

This initializes the block/cell at an index `rowIndex:columnIndex`.

### `grid.bindGrid(onUpdate: (event: DataGridEventType) => void)`

This is used internally (in the `ConfiguredDataGrid`) to trigger a re-render any time the grid as a whole needs to be re-rendered.

### `grid.bindRow(rowIndex, onUpdate: (event: DataGridEventType) => void)`

This is used internally (in the `ConfiguredDataGrid`) to trigger a re-render any time the row label needs to be re-rendered. We are currently not using row labels.

### `grid.bindHeader(columnIndex, onUpdate: (event: DataGridEventType) => void)`

This is used internally (in the `ConfiguredDataGrid`) to trigger a re-render any time the column header needs to be re-rendered.

What happens is, this triggers a callback inside of `DataGrid/Column`, which is currently called `updateBindings`. This simply updates the local state of the React component with the state of the column (whether it is selected, highlighted, etc.).

### `grid.bindBlock(rowIndex, columnIndex, onUpdate: (event: DataGridEventType) => void)`

This is used internally (in the `ConfiguredDataGrid`) to trigger a re-render any time a specific block needs to be re-rendered.

What happens is, this triggers a callback inside of `DataGrid/Block`, which is currently called `updateBindings`. This simply updates the local state of the React component with the state of the block (whether it is selected, highlighted, focused, editing, etc.).

### `grid.unbindGrid`

This just detaches the grid React component as a whole from the manager.

### `grid.unbindRow(rowIndex)`

This just detaches the row React component as a whole from the manager.

### `grid.unbindHeader(columnIndex)`

This just detaches the column React component as a whole from the manager.

### `grid.unbindBlock(rowIndex, columnIndex)`

This just detaches the column React component as a whole from the manager.

### `grid.getRow(rowIndex)`

In case you need the row directly within a component, you can call this.

### `grid.getHeader(columnIndex)`

In case you need the column directly within a component, you can call this.

### `grid.getBlock(rowIndex, columnIndex)`

In case you need the block directly within a component, you can call this.

### `grid.setSelectMode(mode: 'single' | 'multiple' | 'range')`

This is called on keyboard/mouse interactions, to set how it handles selection/interaction.

- `single`: It only selects the currently clicked or keyboard-navigated-to block.
- `multiple`: It keeps the old selected blocks/rows/columns as you click more (holding CMD).
- `range`: Starting from the initially focused block, it selects all blocks close to it as you navigate around, or drag the mouse around from that point (holding SHIFT).

### `grid.deselect()`

Useful if you click outside of the table, for example, to simply remove all interactions from the datagrid.

### `grid.selectRow(rowIndex)`

This figures out which blocks need to be highlighted, and selects the row itself. You can call this in the `DataGrid/Row` component, and it will trigger all appropriate React component updates with the selection information.

### `grid.selectColumn(columnIndex)`

This figures out which blocks need to be highlighted, and selects the column itself. This is called in the `DataGrid/Column` component, and it triggers all appropriate React component updates with the selection information.

### `grid.selectBlock(blockIndex)`

This selects and focuses on a single block, called from within `DataGrid/Block`.

### `grid.createTransaction()`

This initializes a `DataGridTransaction` object, which you use like this:

```js
transaction.setBlockData(rowIndex, columnIndex, data);
```

We have to use this rather than setting on the block directly, to handle batch operations like when you `paste` a bunch of data into the spreadsheet. It counts as 1 single undo operation!

### `grid.commitTransaction(transaction)`

When you are ready to have your transaction applied to the datagrid, call this. It adds 1 undoable operation to the datagrid.

### `grid.editBlockEnter()`

This is called in the `DataGrid` component when you press enter, to "enter into" edit mode in the currently focused block.

### `grid.editBlockExit()`

This is called in the `DataGrid` component when you press escape (or click to a different place), to "exit out of" edit mode in the last focused block.

### `grid.isEditing()`

This just tells you if one of the blocks in the datagrid is currently being edited.

### `grid.navigateLeft()`

This will move the block selection one to the left (unless at the first block in a row). Called on arrow left currently.

### `grid.navigateRight()`

This will move the block selection one to the right (unless at the last block in a row). Called on arrow right and TAB currently.

### `grid.navigateUp()`

This will move the block selection one upward (unless at the first block in a column). Called on arrow up.

### `grid.navigateDown()`

This will move the block selection one downward (unless at the last block in a column). Called on arrow down.

### `grid.loadSpreadsheetText(spreasheetString)`

Call this to handle the paste event when pasting from a native spreadsheet (like Excel or Google Spreadsheets) into our app datagrid/spreadsheet.

### `grid.cutHighlightedText()`

After you have selected a set of blocks, this will remove the values from the datagrid, and return the string/text which you can then paste into a native spreadsheet.

### `grid.copyHighlightedText()`

After you have selected a set of blocks, this will copy the values from the datagrid, returning the string/text which you can then paste into a native spreadsheet.

### `grid.undo`

This undoes the last transaction (edit) done on the datagrid data.

### `grid.redo`

This redoes the last transaction (edit) done on the datagrid data.

## Note on `DataGridManager`

All other methods in the `DataGridManager` like `triggerColumnEvent` or `computeCollectionRemovals` or `applyInteractionAdditions` are internal and used for implementing managing/computing the state of the datagrid. You don't ever need to call these ones directly.
