# Editable DataGrid in React and TypeScript

## Development

```
yarn install-all
```

Then in two terminal windows:

```
yarn watch
```

```
yarn playground
```

## Example

```jsx
const exampleColumn = [
  {
    header: 'Foo',
    field: 'foo',
    align: 'right',
    width: 120,
    formatter: 'money',
    editor: 'money',
    serializer: moneySerializer,
  },
];

// map the roles/bands to the `DataGrid` data model.
useEffect(() => {
  if (!spreadsheetRows?.length) {
    return;
  }

  // instantiate the grid if necessary.
  grid.size(spreadsheetRows.length, columns.length);

  // configure the columns
  columns.forEach((column, columnIndex) => {
    grid.setColumnField(columnIndex, 'key', column.header);
    grid.setColumnField(columnIndex, 'field', column.field);
    grid.setColumnField(columnIndex, 'serializer', column.serializer);
    grid.setColumnField(columnIndex, 'deserializer', column.deserializer);
  });

  // configure rows
  spreadsheetRows.forEach((row, rowIndex) => {
    grid.setRowField(rowIndex, 'key', `band-${row.id}`);
    grid.setRowField(rowIndex, 'dataKey', row.id);
    grid.setRowField(rowIndex, 'data', row);
  });

  // configure blocks
  spreadsheetRows.forEach((row, rowIndex) => {
    columns.forEach((column, columnIndex) => {
      const data = row[column.field as keyof BandsSpreadsheetRowType];
      // the key can use the columnIndex, since it won't change for now.
      // but the rowIndex might change on sorting,
      // so need to use the record id.
      const blockKey = `block-${row.id}-${columnIndex}`;
      grid.setBlockField(rowIndex, columnIndex, 'key', blockKey);
      grid.setBlockField(
        rowIndex,
        columnIndex,
        'editable',
        Boolean(column.editor)
      );
      grid.setBlockField(rowIndex, columnIndex, 'data', data);
    });
  });
}, [grid, spreadsheetRows, columns]);

<ConfiguredDataGrid grid={grid} columns={columns} />
```
