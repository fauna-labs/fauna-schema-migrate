"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toIndexableName = void 0;
var toIndexableName = function (expr) {
    return expr.type + "_-_" + expr.name;
};
exports.toIndexableName = toIndexableName;
