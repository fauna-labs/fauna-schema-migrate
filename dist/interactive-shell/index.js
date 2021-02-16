"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderOptions = exports.interactiveShell = void 0;
var react_1 = __importDefault(require("react"));
var ink_1 = require("ink");
var ink_gradient_1 = __importDefault(require("ink-gradient"));
var ink_big_text_1 = __importDefault(require("ink-big-text"));
var select_input_1 = __importDefault(require("./ink-select-input/select-input"));
var ink_divider_1 = __importDefault(require("ink-divider"));
var tasks_1 = __importDefault(require("../tasks/tasks"));
var version = require('./../../package.json').version;
// Todo, what about contrast?
var faunaPurple1 = "#601FCA";
var faunaPurple2 = "#7F3CED";
var graySubtitle = "#bbbbbb";
var interactiveShell = function () {
    return ink_1.render(react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(ink_1.Box, { height: 4 },
            react_1.default.createElement(ink_gradient_1.default, { colors: [faunaPurple1, faunaPurple2] },
                react_1.default.createElement(ink_big_text_1.default, { font: "tiny", text: "Fauna ", lineHeight: 2 })),
            react_1.default.createElement(ink_1.Box, { height: "100%", alignItems: "flex-end", justifyContent: "flex-end", paddingTop: 1 },
                react_1.default.createElement(ink_1.Text, { color: graySubtitle },
                    "Schema Migrate ",
                    version))),
        react_1.default.createElement(ink_divider_1.default, { dividerColor: faunaPurple2 }),
        exports.renderOptions()));
};
exports.interactiveShell = interactiveShell;
var renderOptions = function () {
    var handleTaskChoice = function (items) {
        console.log(items);
        // `items` = [{ label: 'First', value: 'first' }, { label: 'Third', value: 'third' }]
    };
    var items = tasks_1.default
        .filter(function (t) { return t.name !== 'run'; })
        .map(function (t) {
        return {
            label: t.name,
            value: t.action,
            description: t.description,
            color: faunaPurple2
        };
    });
    var res = react_1.default.createElement(select_input_1.default, { items: items, onSelect: handleTaskChoice });
    return res;
};
exports.renderOptions = renderOptions;
