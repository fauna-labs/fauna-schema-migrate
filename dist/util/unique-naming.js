"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toIndexableNameFromTypeAndName = exports.toIndexableNameWithDb = exports.toIndexableName = void 0;
var toIndexableName = function (expr) {
    return expr.type + "_-_" + expr.name;
};
exports.toIndexableName = toIndexableName;
var toIndexableNameWithDb = function (expr) {
    return expr.db.join("/") + "_-_" + expr.type + "_-_" + expr.name;
};
exports.toIndexableNameWithDb = toIndexableNameWithDb;
var toIndexableNameFromTypeAndName = function (type, name) {
    return type + "_-_" + name;
};
exports.toIndexableNameFromTypeAndName = toIndexableNameFromTypeAndName;
