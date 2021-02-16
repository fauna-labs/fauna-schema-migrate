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
var ink_gradient_1 = __importDefault(require("ink-gradient"));
var ink_big_text_1 = __importDefault(require("ink-big-text"));
var ink_divider_1 = __importDefault(require("ink-divider"));
var colors_1 = require("../colors");
// eslint-disable-next-line react/function-component-definition
function Header(props) {
    return React.createElement(React.Fragment, null,
        React.createElement(ink_1.Box, { height: 4 },
            React.createElement(ink_gradient_1.default, { colors: [colors_1.faunaPurple1, colors_1.faunaPurple2] },
                React.createElement(ink_big_text_1.default, { font: "tiny", text: props.title, lineHeight: 2 })),
            React.createElement(ink_1.Box, { height: "100%", alignItems: "flex-end", justifyContent: "flex-end", paddingTop: 1 },
                React.createElement(ink_1.Text, { color: colors_1.gray }, props.subtitle))),
        React.createElement(ink_divider_1.default, { dividerColor: colors_1.faunaPurple2 }));
}
exports.default = Header;
