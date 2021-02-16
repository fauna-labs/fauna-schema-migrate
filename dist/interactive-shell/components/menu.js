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
var select_input_1 = __importDefault(require("./select-input"));
var tasks_1 = require("../../tasks");
var colors_1 = require("../colors");
// eslint-disable-next-line react/function-component-definition
function Menu(props) {
    var renderOptions = function () {
        var items = tasks_1.tasks
            .filter(function (t) { return t.name !== 'run'; })
            .map(function (t) {
            return {
                label: t.name,
                action: t.action,
                description: t.description,
                color: colors_1.faunaPurple2
            };
        });
        var res = React.createElement(select_input_1.default, { items: items, onSelect: props.handleTaskChoice });
        return res;
    };
    return React.createElement(React.Fragment, null, renderOptions());
}
exports.default = Menu;
