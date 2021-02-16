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
var React = __importStar(require("react"));
var task_list_1 = __importDefault(require("./../task-list-component/task-list"));
var menu_1 = __importDefault(require("./../menu-component/menu"));
var react_hookstore_1 = require("react-hookstore");
var interactive_shell_1 = require("./../interactive-shell");
// eslint-disable-next-line react/function-component-definition
function Shell(props) {
    var _a = react_hookstore_1.useStore('cliState'), cliState = _a[0], setCliState = _a[1];
    return React.createElement(React.Fragment, null,
        React.createElement(task_list_1.default, null),
        cliState === interactive_shell_1.ShellState.Menu ? React.createElement(menu_1.default, { handleTaskChoice: props.handleMenuSelection }) : null);
}
exports.default = Shell;
