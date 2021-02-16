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
var ink_1 = require("ink");
var react_hookstore_1 = require("react-hookstore");
var header_1 = __importDefault(require("./header"));
var header_message_1 = require("../messages/header-message");
var colors_1 = require("../colors");
// eslint-disable-next-line react/function-component-definition
function Messages(props) {
    var _a = react_hookstore_1.useStore('messages'), tasks = _a[0], setTasks = _a[1];
    return React.createElement(ink_1.Static, { items: tasks }, handleItem);
}
function handleItem(nm) {
    console.log(typeof nm.message.message);
    if (nm.message instanceof header_message_1.HeaderMessage) {
        return React.createElement(header_1.default, { key: "header_" + nm.id, title: nm.message.message, subtitle: nm.message.subtitle });
    }
    else if (typeof nm.message.message === 'object') {
        return nm.message.message;
    }
    else if (typeof nm.message.message === 'string') {
        return React.createElement(ink_1.Box, { key: "message_" + nm.id },
            React.createElement(ink_1.Text, { color: colors_1.faunaPurple1 }, " \u2714 "),
            React.createElement(ink_1.Text, { color: colors_1.white },
                " ",
                nm.message.message));
    }
    else {
        throw new Error("Unexpected message type " + typeof nm.message.message);
    }
}
exports.default = Messages;
