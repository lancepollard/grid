/* eslint-disable */
import React, { useMemo, useCallback, useContext, useState, useRef, useEffect } from 'react';

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

var GridContext = React.createContext({
    subscribe: function (row, column, callback) { },
    unsubscribe: function (row, column) { },
    setIndex: function (row, column) { },
});
function GridColumn(props) {
    return (React.createElement("th", null, props.header()));
}
function GridValue(_a) {
    var record = _a.record, column = _a.column, rowIndex = _a.rowIndex, columnIndex = _a.columnIndex;
    var _b = useContext(GridContext), subscribe = _b.subscribe, unsubscribe = _b.unsubscribe, setIndex = _b.setIndex;
    var _c = useState(false), isSelected = _c[0], setIsSelected = _c[1];
    var _d = useState(false), isEditing = _d[0], setIsEditing = _d[1];
    var tdRef = useRef();
    useEffect(function () {
        var updateSelect = function (selected, editing) {
            tdRef.current.focus();
            setIsSelected(selected);
            setIsEditing(editing);
        };
        subscribe(rowIndex, columnIndex, updateSelect);
        return function () { return unsubscribe(rowIndex, columnIndex); };
    }, [subscribe, unsubscribe, setIsSelected, setIsEditing]);
    var handleRowClick = useCallback(function () {
        setIndex(rowIndex, columnIndex);
    }, [setIndex, rowIndex, columnIndex]);
    return (React.createElement("td", { tabIndex: 0, ref: tdRef, onClick: handleRowClick }, column.value(record, { isSelected: isSelected, isEditing: isEditing })));
}
function GridRow(_a) {
    var rowIndex = _a.rowIndex, record = _a.record, columns = _a.columns;
    return (React.createElement("tr", null, columns.map(function (column, columnIndex) { return (React.createElement(GridValue, { record: record, column: column, rowIndex: rowIndex, columnIndex: columnIndex })); })));
}
function Grid(_a) {
    var rows = _a.rows, columns = _a.columns;
    var selectedValueIndex = [-1, -1];
    var subscriptions = useMemo(function () { return new Map(); }, []);
    var setIndex = useCallback(function (row, column) {
        var oldCallback = subscriptions.get("".concat(selectedValueIndex[0], ":").concat(selectedValueIndex[1]));
        if (oldCallback) {
            oldCallback(false);
        }
        selectedValueIndex[0] = row;
        selectedValueIndex[1] = column;
        var callback = subscriptions.get("".concat(row, ":").concat(column));
        if (callback) {
            callback(true);
        }
    }, [selectedValueIndex]);
    var subscribe = useCallback(function (row, column, callback) {
        subscriptions.set("".concat(row, ":").concat(column), callback);
    }, [subscriptions]);
    var unsubscribe = useCallback(function (row, column) {
        subscriptions.delete("".concat(row, ":").concat(column));
    }, [subscriptions]);
    var state = { subscribe: subscribe, unsubscribe: unsubscribe, setIndex: setIndex };
    var handleKeyPress = useCallback(function (event) {
        if (typeof event.code !== 'string') {
            return;
        }
        switch (event.code) {
            case 'ArrowLeft':
                setIndex(selectedValueIndex[0], Math.max(0, selectedValueIndex[1] - 1));
                break;
            case 'ArrowRight':
                setIndex(selectedValueIndex[0], Math.min(selectedValueIndex[1] + 1, rows.length - 1));
                break;
            case 'ArrowUp':
                setIndex(Math.max(0, selectedValueIndex[0] - 1), selectedValueIndex[1]);
                break;
            case 'ArrowDown':
                setIndex(Math.min(selectedValueIndex[0] + 1, columns.length - 1), selectedValueIndex[1]);
                break;
        }
    }, [setIndex]);
    return (React.createElement(GridContext.Provider, { value: state },
        React.createElement("table", { onKeyUp: handleKeyPress },
            React.createElement("thead", null,
                React.createElement("tr", null, columns.map(function (column) { return React.createElement(GridColumn, __assign({}, column)); }))),
            React.createElement("tbody", null, rows.map(function (record, rowIndex) { return (React.createElement(GridRow, { record: record, columns: columns, rowIndex: rowIndex })); })))));
}

export { Grid as default };
