# ConfiguredDataGrid Component

This is our _implementation_ of the `DataGrid` component. It comes with all the custom-built / design-specific components to render the `DataGrid` how we want.

We don't need to really worry about these standard components:

- `./Block/index.tsx`
- `./Block/Editable`: Our standard implementation of an Editable block, which uses a custom `Editor` which you pass.
- `./Block/Formatible`: Our standard implementation of a "formatible" block, which uses a custom `Formatter` which you pass.
- `./Block/Container`: Just some custom styles for the block generically.
- `./Column`: Just converts our regular Column JSON object into the internal DataGrid column.
- `./Header/Basic`: Standard column header implementation. We can create another one if we really need it, but this should be pretty fixed for the most part.

Most of the customizability is added to the `./Block` folder, such as these components:

- `./Block/Money`: Implements the formatter and editor for the `MoneyType`.
- `./Block/String`: Implements a formatter for a simple string.
- `./Block/StringArray`: Implements a formatter for a simple `Array<string>`.

As we discover new needs for more block types, we can add those here. Then we add the key/name of the block formatter and editor (Editor is not required) to `ConfiguredDataGrid/types.ts`.

Then to implement a `ConfigredDataGrid`, you basically have to define the columns, add any newly discovered block types (formatters and potentially editors), and instantiate the `grid`, which is described in more detail in the `DataGrid` readme.

See the `Bands/Sheet.tsx` for an example of how a fully-finished implementation of `ConfiguredDataGrid` looks and feels.

## Column Definitions

Here is an example of a simple column which uses a string formatter and no editor.

```js
{
  header: 'Level',
  field: 'level',
  width: 80,
  align: 'center',
  formatter: 'string',
  sorter: (a: DenormalizedRoleType, b: DenormalizedRoleType) => {
    return (a.role.level?.position ?? 0) - (b.role.level?.position ?? 0);
  },
}
```

Some notes:

- `header`: This is a string which is the header label.
- `field`: The field to read from the record.
- `width`: Optional width (defaults to 100).
- `align`: Optional block alignment (defaults to left).
- `formatter`: This is the key defined in `ConfiguredDataGrid/types.ts` which maps to a formatter component.
- `editor`: While not used in this example, this is the key defined in `ConfiguredDataGrid/types.ts` which maps to an _editor_ component.
- `sorter`: This will allow column sorting.

Here is an example on a `MoneyType` column:

```js
{
  header: 'Salary Low',
  align: 'right',
  width: 120,
  formatter: 'money',
  editor: 'money',
  serializer: moneySerializer,
  loader: (record: DenormalizedRoleType) => record.band.salaryLowerBound,
}
```

### ConfiguredDataGrid Implementation

As seen in `Bands/Sheet.tsx`, this is how you would completely define and use a new `ConfiguredDataGrid`.

```js
function MySheet() {
  const grid = useDataGrid();

  const columns = [
    {
      header: 'Equity High',
      field: 'equity',
      align: 'right',
      width: 120,
      formatter: 'money',
      editor: 'money',
      loader: record => record.band.equityUpperBound,
    },
  ];

  // map the spreadsheetRows to the `DataGrid` data model.
  useEffect(() => {
    if (!spreadsheetRows?.length) {
      return
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
        grid.setBlockField(rowIndex, columnIndex, 'editable', Boolean(column.editor) && canWriteBands);
        grid.setBlockField(rowIndex, columnIndex, 'data', data);
      });
    });
  }, [grid, spreadsheetRows, columns]);

  return <ConfiguredDataGrid grid={grid} columns={columns} />;
}
```

As you can see, the biggest part is is initializing the datagrid using these 3 methods:

- `grid.setRowField`
- `grid.setColumnField`
- `grid.setBlockField`

Those are all described in more detail in the `DataGrid` component readme in the app.
