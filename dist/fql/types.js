"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveReference = exports.addNamesAndTypes = void 0;
var cloneDeep = require('lodash.clonedeep');
var expressions_1 = require("../types/expressions");
var resource_types_1 = require("../types/resource-types");
exports.addNamesAndTypes = function (snippets) {
    snippets.forEach(function (s) {
        // console.log('testing snippet', s)
        var res = getMatchingResult(s);
        s.type = res.type;
        s.name = res.name;
        s.jsonData = res.jsonData;
        s.statement = res.statement;
    });
};
exports.retrieveReference = function (snippet) {
    return snippet.json.ref;
};
var getMatchingResult = function (s) {
    var matchers = [
        isUdfExpression,
        isRoleExpression
    ];
    for (var _i = 0, matchers_1 = matchers; _i < matchers_1.length; _i++) {
        var m = matchers_1[_i];
        var res = m(s);
        if (res)
            return res;
    }
    console.log(s);
    throw new Error("Unknown snippet type " + s.toString().substring(0, 50) + " ...");
};
var isUdfExpression = function (snippet) {
    var resType = resource_types_1.ResourceTypes.Function;
    return isCreateFqlExpressionOfType(snippet, 'create_function', resType) ||
        isDeleteFqlExpressionOfType(snippet, 'function', resType) ||
        isUpdateFqlExpressionOfType(snippet, 'function', resType);
};
var isRoleExpression = function (snippet) {
    var resType = resource_types_1.ResourceTypes.Role;
    return isCreateFqlExpressionOfType(snippet, 'create_role', resType) ||
        isDeleteFqlExpressionOfType(snippet, 'role', resType) ||
        isUpdateFqlExpressionOfType(snippet, 'role', resType);
};
var isCreateFqlExpressionOfType = function (snippet, exprType, resType) {
    if (Object.keys(snippet.fqlExpr.raw).includes(exprType)) {
        // remove the name so it compared more easily to an Update statement.
        var name_1 = snippet.json[exprType].object.name;
        var jsonData = cloneDeep(snippet.json[exprType].object);
        delete jsonData.name;
        return {
            jsonData: jsonData,
            name: name_1,
            type: resType,
            statement: expressions_1.StatementType.Create
        };
    }
    else {
        return false;
    }
};
var isUpdateFqlExpressionOfType = function (snippet, exprType, resType) {
    if (snippet.fqlExpr.raw.update && Object.keys(snippet.fqlExpr.raw.update.raw).includes(exprType)) {
        return {
            jsonData: snippet.json.params.object,
            name: snippet.json.update[exprType],
            type: resType,
            statement: expressions_1.StatementType.Update
        };
    }
    else {
        return false;
    }
};
var isDeleteFqlExpressionOfType = function (snippet, exprType, resType) {
    if (snippet.fqlExpr.raw.delete && Object.keys(snippet.fqlExpr.raw.delete.raw).includes(exprType)) {
        return {
            jsonData: {},
            name: snippet.json.delete[exprType],
            type: resType,
            statement: expressions_1.StatementType.Delete
        };
    }
    else {
        return false;
    }
};
