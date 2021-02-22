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
var message_list_1 = __importDefault(require("./message-list"));
var menu_1 = __importDefault(require("./menu"));
var react_hookstore_1 = require("react-hookstore");
var interactive_shell_1 = require("../interactive-shell");
var user_input_1 = __importDefault(require("./user-input"));
// eslint-disable-next-line react/function-component-definition
function Shell(props) {
    var cliState = react_hookstore_1.useStore('cliState')[0];
    var task = react_hookstore_1.useStore('task')[0];
    return React.createElement(React.Fragment, null,
        React.createElement(message_list_1.default, null),
        task !== null ?
            task :
            null,
        cliState === interactive_shell_1.ShellState.UserInput ?
            React.createElement(user_input_1.default, { handleUserInput: props.handleUserInput }) :
            null,
        cliState === interactive_shell_1.ShellState.Menu ?
            React.createElement(menu_1.default, { handleTaskChoice: props.handleMenuSelection }) :
            null);
}
exports.default = Shell;
