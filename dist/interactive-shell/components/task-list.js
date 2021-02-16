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
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var ink_1 = require("ink");
var react_hookstore_1 = require("react-hookstore");
// eslint-disable-next-line react/function-component-definition
function TaskList(props) {
    var _a = react_hookstore_1.useStore('tasksProgress'), tasks = _a[0], setTasks = _a[1];
    return React.createElement(ink_1.Static, { items: tasks }, function (task) { return (React.createElement(ink_1.Box, { key: task.id },
        React.createElement(ink_1.Text, { color: "green" },
            "\u2714 ",
            task.title))); });
}
exports.default = TaskList;
