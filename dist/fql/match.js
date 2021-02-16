"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveReference = exports.verifyCreateStatementsOnly = exports.addNamesAndTypes = void 0;
var cloneDeep = require('lodash.clonedeep');
var WrongCreateTypeError_1 = require("../errors/WrongCreateTypeError");
var WrongResourceTypeError_1 = require("../errors/WrongResourceTypeError");
var expressions_1 = require("../types/expressions");
var resource_types_1 = require("../types/resource-types");
var transform_1 = require("./transform");
var addNamesAndTypes = function (snippets) {
    snippets.forEach(function (s) {
        var res = getMatchingResult(s);
        s.type = res.type;
        s.name = res.name;
        s.jsonData = res.jsonData;
        s.statement = res.statement;
    });
};
exports.addNamesAndTypes = addNamesAndTypes;
var verifyCreateStatementsOnly = function (snippets) {
    snippets.forEach(function (s) {
        var res = getMatchingResult(s);
        if (res.statement !== expressions_1.StatementType.Create) {
            throw new WrongResourceTypeError_1.WrongResourceTypeError(s);
        }
    });
};
exports.verifyCreateStatementsOnly = verifyCreateStatementsOnly;
var retrieveReference = function (snippet) {
    return snippet.json.ref;
};
exports.retrieveReference = retrieveReference;
var getMatchingResult = function (s) {
    var matchers = [
        createMatcher(resource_types_1.ResourceTypes.Collection),
        createMatcher(resource_types_1.ResourceTypes.Index),
        createMatcher(resource_types_1.ResourceTypes.Function),
        createMatcher(resource_types_1.ResourceTypes.Role),
        createMatcher(resource_types_1.ResourceTypes.AccessProvider),
        createMatcher(resource_types_1.ResourceTypes.Database)
    ];
    for (var _i = 0, matchers_1 = matchers; _i < matchers_1.length; _i++) {
        var m = matchers_1[_i];
        var res = m(s);
        if (res)
            return res;
    }
    throw new WrongCreateTypeError_1.WrongMigrationTypeError(s);
};
// Seems to be always the same. We could simplify the code
var createMatcher = function (resType) {
    return function (snippet) {
        return isCreateFqlExpressionOfType(snippet, resType) ||
            isDeleteFqlExpressionOfType(snippet, resType) ||
            isUpdateFqlExpressionOfType(snippet, resType);
    };
};
var isCreateFqlExpressionOfType = function (snippet, resType) {
    var stringResType = 'create_' + transform_1.camelToSnakeCase(resType);
    if (Object.keys(snippet.fqlExpr.raw).includes(stringResType)) {
        // remove the name so it compared more easily to an Update statement.
        return {
            jsonData: transform_1.getJsonData(snippet.fqlExpr, resType, expressions_1.StatementType.Create),
            name: snippet.fqlExpr.raw[stringResType].raw.object.name,
            type: resType,
            statement: expressions_1.StatementType.Create
        };
    }
    else {
        return false;
    }
};
var isUpdateFqlExpressionOfType = function (snippet, resType) {
    var stringResType = transform_1.camelToSnakeCase(resType);
    if (snippet.fqlExpr.raw.update && Object.keys(snippet.fqlExpr.raw.update.raw).includes(stringResType)) {
        return {
            jsonData: transform_1.getJsonData(snippet.fqlExpr, resType, expressions_1.StatementType.Update),
            name: snippet.fqlExpr.raw.update.raw[stringResType],
            type: resType,
            statement: expressions_1.StatementType.Update
        };
    }
    else {
        return false;
    }
};
var isDeleteFqlExpressionOfType = function (snippet, resType) {
    var stringResType = transform_1.camelToSnakeCase(resType);
    if (snippet.fqlExpr.raw.delete && Object.keys(snippet.fqlExpr.raw.delete.raw).includes(stringResType)) {
        return {
            jsonData: {},
            name: snippet.fqlExpr.raw.delete.raw[stringResType],
            type: resType,
            statement: expressions_1.StatementType.Delete
        };
    }
    else {
        return false;
    }
};
