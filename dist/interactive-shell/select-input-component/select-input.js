"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var react_1 = require("react");
var ink_1 = require("ink");
var indicator_1 = __importDefault(require("./indicator"));
var item_1 = __importDefault(require("./item"));
var deepEqual = require("deep-equal");
var arrayRotate = function (input, n) {
    var x = input.slice();
    var num = typeof n === 'number' ? n : 0;
    return x.splice(-num % x.length).concat(x);
};
// eslint-disable-next-line react/function-component-definition
function SelectInput(_a) {
    var _b = _a.items, items = _b === void 0 ? [] : _b, _c = _a.isFocused, isFocused = _c === void 0 ? true : _c, _d = _a.initialIndex, initialIndex = _d === void 0 ? 0 : _d, _e = _a.indicatorComponent, indicatorComponent = _e === void 0 ? indicator_1.default : _e, _f = _a.itemComponent, itemComponent = _f === void 0 ? item_1.default : _f, customLimit = _a.limit, onSelect = _a.onSelect, onHighlight = _a.onHighlight;
    var _g = react_1.useState(0), rotateIndex = _g[0], setRotateIndex = _g[1];
    var _h = react_1.useState(initialIndex), selectedIndex = _h[0], setSelectedIndex = _h[1];
    var hasLimit = typeof customLimit === 'number' && items.length > customLimit;
    var limit = hasLimit ? Math.min(customLimit, items.length) : items.length;
    var previousItems = react_1.useRef(items);
    react_1.useEffect(function () {
        if (!deepEqual(previousItems.current.map(function (item) { return item.action; }), items.map(function (item) { return item.action; }))) {
            setRotateIndex(0);
            setSelectedIndex(0);
        }
        previousItems.current = items;
    }, [items]);
    ink_1.useInput(react_1.useCallback(function (input, key) {
        if (input === 'k' || key.upArrow) {
            var lastIndex = (hasLimit ? limit : items.length) - 1;
            var atFirstIndex = selectedIndex === 0;
            var nextIndex = hasLimit ? selectedIndex : lastIndex;
            var nextRotateIndex = atFirstIndex ? rotateIndex + 1 : rotateIndex;
            var nextSelectedIndex = atFirstIndex
                ? nextIndex
                : selectedIndex - 1;
            setRotateIndex(nextRotateIndex);
            setSelectedIndex(nextSelectedIndex);
            var slicedItems_1 = hasLimit
                ? arrayRotate(items, nextRotateIndex).slice(0, limit)
                : items;
            if (typeof onHighlight === 'function') {
                var selection = slicedItems_1[nextSelectedIndex];
                onHighlight(selection);
            }
        }
        if (input === 'j' || key.downArrow) {
            var atLastIndex = selectedIndex === (hasLimit ? limit : items.length) - 1;
            var nextIndex = hasLimit ? selectedIndex : 0;
            var nextRotateIndex = atLastIndex ? rotateIndex - 1 : rotateIndex;
            var nextSelectedIndex = atLastIndex ? nextIndex : selectedIndex + 1;
            setRotateIndex(nextRotateIndex);
            setSelectedIndex(nextSelectedIndex);
            var slicedItems_2 = hasLimit
                ? arrayRotate(items, nextRotateIndex).slice(0, limit)
                : items;
            if (typeof onHighlight === 'function') {
                var selection = slicedItems_2[nextSelectedIndex];
                onHighlight(selection);
            }
        }
        if (key.return) {
            var slicedItems_3 = hasLimit
                ? arrayRotate(items, rotateIndex).slice(0, limit)
                : items;
            if (typeof onSelect === 'function') {
                var selection = slicedItems_3[selectedIndex];
                onSelect(selection);
            }
        }
    }, [
        hasLimit,
        limit,
        rotateIndex,
        selectedIndex,
        items,
        onSelect,
        onHighlight
    ]), { isActive: isFocused });
    var slicedItems = hasLimit
        ? arrayRotate(items, rotateIndex).slice(0, limit)
        : items;
    return (React.createElement(ink_1.Box, { flexDirection: "column" }, slicedItems.map(function (item, index) {
        var _a;
        var isSelected = index === selectedIndex;
        return (React.createElement(ink_1.Box, { key: (_a = item.key) !== null && _a !== void 0 ? _a : item.label },
            React.createElement(indicatorComponent, { isSelected: isSelected }),
            React.createElement(itemComponent, __assign(__assign({}, item), { isSelected: isSelected }))));
    })));
}
exports.default = SelectInput;
