/* eslint-disable */
import React from 'react';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function GridColumn(props) {
    return (React.createElement("th", null, props.header()));
}
function GridValue(_a) {
    var record = _a.record, column = _a.column;
    return (React.createElement("td", null, column.value(record)));
}
function GridRow(_a) {
    var record = _a.record, columns = _a.columns;
    return (React.createElement("tr", null, columns.map(function (column) { return React.createElement(GridValue, { record: record, column: column }); })));
}
function Grid(_a) {
    var rows = _a.rows, columns = _a.columns;
    return (React.createElement("table", null,
        React.createElement("thead", null,
            React.createElement("tr", null, columns.map(function (column) { return React.createElement(GridColumn, __assign({}, column)); }))),
        React.createElement("tbody", null, rows.map(function (record) { return (React.createElement(GridRow, { record: record, columns: columns })); }))));
}

export { Grid as default };
