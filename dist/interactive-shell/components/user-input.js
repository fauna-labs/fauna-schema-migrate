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
var react_1 = __importStar(require("react"));
var ink_1 = require("ink");
var react_hookstore_1 = require("react-hookstore");
function UserInput(props) {
    var _a = react_1.useState(""), capturedInput = _a[0], setCapturedInput = _a[1];
    var question = react_hookstore_1.useStore('question')[0];
    ink_1.useInput(function (input, key) {
        if (key.return) {
            var input_1 = capturedInput.replace(/\s/g, '');
            setCapturedInput("");
            props.handleUserInput(input_1);
        }
        else {
            setCapturedInput(capturedInput + input);
        }
    });
    if (capturedInput && capturedInput.length > 0) {
        return react_1.default.createElement(react_1.default.Fragment, null,
            question,
            react_1.default.createElement(ink_1.Box, { marginLeft: 6, height: 3, width: 80, borderStyle: "round", borderColor: 'grey' },
                react_1.default.createElement(ink_1.Text, null, "*".repeat(capturedInput.length))));
    }
    else {
        return react_1.default.createElement(react_1.default.Fragment, null,
            question,
            react_1.default.createElement(ink_1.Box, { marginLeft: 6, height: 3, width: 80, borderStyle: "round", borderColor: 'grey' }));
    }
}
exports.default = UserInput;
