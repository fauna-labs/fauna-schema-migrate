"use strict";
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
var version = require('./../../../package.json').version;
var React = __importStar(require("react"));
var ink_1 = require("ink");
var ink_gradient_1 = __importDefault(require("ink-gradient"));
var ink_big_text_1 = __importDefault(require("ink-big-text"));
var ink_divider_1 = __importDefault(require("ink-divider"));
var select_input_1 = __importDefault(require("../select-input-component/select-input"));
var tasks_1 = __importDefault(require("../../tasks/tasks"));
// Todo, what about contrast?
var faunaPurple1 = "#601FCA";
var faunaPurple2 = "#7F3CED";
var graySubtitle = "#bbbbbb";
// eslint-disable-next-line react/function-component-definition
function Menu(props) {
    var renderFauna = function () {
        return React.createElement(React.Fragment, null,
            React.createElement(ink_1.Box, { height: 4 },
                React.createElement(ink_gradient_1.default, { colors: [faunaPurple1, faunaPurple2] },
                    React.createElement(ink_big_text_1.default, { font: "tiny", text: "Fauna ", lineHeight: 2 })),
                React.createElement(ink_1.Box, { height: "100%", alignItems: "flex-end", justifyContent: "flex-end", paddingTop: 1 },
                    React.createElement(ink_1.Text, { color: graySubtitle },
                        "Schema Migrate ",
                        version))),
            React.createElement(ink_divider_1.default, { dividerColor: faunaPurple2 }));
    };
    var renderOptions = function () {
        var items = tasks_1.default
            .filter(function (t) { return t.name !== 'run'; })
            .map(function (t) {
            return {
                label: t.name,
                action: t.action,
                description: t.description,
                color: faunaPurple2
            };
        });
        var res = React.createElement(select_input_1.default, { items: items, onSelect: props.handleTaskChoice });
        return res;
    };
    return React.createElement(React.Fragment, null,
        renderFauna(),
        renderOptions());
}
exports.default = Menu;
