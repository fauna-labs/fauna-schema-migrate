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
exports.getJsonData = exports.toTaggedExpr = exports.camelToSnakeCase = exports.transformDbNameToFqlGeneric = exports.transformDbPathToDelete = exports.transformDbPathToUpdate = exports.transformDbPathToCreate = exports.transformUpdateToDelete = exports.transformUpdateToUpdate = exports.transformCreateToDelete = exports.transformCreateToUpdate = exports.explicitelySetAllParameters = exports.transformUpdateToCreate = exports.createStub = void 0;
var fauna = __importStar(require("faunadb"));
var lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
var _a = fauna.query, Update = _a.Update, Delete = _a.Delete, CreateFunction = _a.CreateFunction, CreateCollection = _a.CreateCollection, CreateAccessProvider = _a.CreateAccessProvider, CreateIndex = _a.CreateIndex, CreateRole = _a.CreateRole, Role = _a.Role, Function = _a.Function, Collection = _a.Collection, Index = _a.Index, AccessProvider = _a.AccessProvider, Database = _a.Database, CreateDatabase = _a.CreateDatabase, Var = _a.Var, Query = _a.Query, Lambda = _a.Lambda;
var expressions_1 = require("../types/expressions");
var resource_types_1 = require("../types/resource-types");
var createStub = function (expr) {
    // Just create an empty stub from a create expression.
    if (!expr.type) {
        // could also improve my types instead.
        throw new Error("Expression type undefined " + expr);
    }
    else {
        var original = expr.fqlExpr.raw["create_" + exports.camelToSnakeCase(expr.type)].raw.object;
        var fqlFunction = resourceTypeToFqlCreateFunction(expr);
        var obj = { name: original.name };
        addRequiredProps(expr, obj);
        return exports.toTaggedExpr(expr, fqlFunction(obj), expressions_1.StatementType.Create);
    }
};
exports.createStub = createStub;
var transformUpdateToCreate = function (expr) {
    if (!expr.type) {
        // could also improve my types instead.
        throw new Error("Expression type undefined " + expr);
    }
    else {
        var obj1 = expr.fqlExpr.raw.params.raw.object;
        obj1.name = expr.name;
        var fqlFunction = resourceTypeToFqlCreateFunction(expr);
        return exports.toTaggedExpr(expr, fqlFunction(obj1), expressions_1.StatementType.Create);
    }
};
exports.transformUpdateToCreate = transformUpdateToCreate;
var explicitelySetAllParameters = function (expr) {
    if (expr.statement !== expressions_1.StatementType.Update) {
        throw new Error("explicitelySetAllParameters is only meant for update expressions, received: " + expr.statement);
    }
    // update only updates what is set.
    switch (expr.type) {
        case resource_types_1.ResourceTypes.Collection:
            setExplicitUpdateParameters({ data: null, history_days: 30, ttl_days: null, permissions: null }, expr);
            return exports.toTaggedExpr(expr, expr.fqlExpr, expressions_1.StatementType.Update);
        // case ResourceTypes.Index:
        // ignore, indexes are never updated
        case resource_types_1.ResourceTypes.Function:
            setExplicitUpdateParameters({ data: null, body: null, role: null }, expr);
            return exports.toTaggedExpr(expr, expr.fqlExpr, expressions_1.StatementType.Update);
        case resource_types_1.ResourceTypes.Role:
            setExplicitUpdateParameters({ data: null, privileges: null, membership: null }, expr);
            return exports.toTaggedExpr(expr, expr.fqlExpr, expressions_1.StatementType.Update);
        case resource_types_1.ResourceTypes.AccessProvider:
            setExplicitUpdateParameters({ data: null, issuer: null, jwks_uri: null, roles: null }, expr);
            return exports.toTaggedExpr(expr, expr.fqlExpr, expressions_1.StatementType.Update);
        case resource_types_1.ResourceTypes.Database:
            setExplicitUpdateParameters({ data: null, priority: null }, expr);
            return exports.toTaggedExpr(expr, expr.fqlExpr, expressions_1.StatementType.Update);
        default:
            throw new Error("Unknown type " + expr.type);
    }
};
exports.explicitelySetAllParameters = explicitelySetAllParameters;
var addRequiredProps = function (expr, obj) {
    switch (expr.type) {
        case resource_types_1.ResourceTypes.Function:
            obj.body = Query(Lambda('x', Var('x')));
            return;
        case resource_types_1.ResourceTypes.AccessProvider:
            // let's take an auth0 issueras dummy
            obj.issuer = 'https://faunadb-auth0.auth0.com/';
            obj.jwks_uri = 'https://faunadb-auth0.auth0.com.well-known/jwks.json';
            return;
        case resource_types_1.ResourceTypes.Role:
            obj.privileges = [];
            return;
        default:
            // Some (e.g. collection, role) don't have required props.
            // We don't stub indexes since they can't live without a source.
            // instead indexes are always moved to the end.
            return;
    }
};
var setExplicitUpdateParameters = function (params, expr) {
    Object.keys(params).forEach(function (key) {
        if (expr.fqlExpr.raw.params.raw.object[key] === undefined) {
            expr.fqlExpr.raw.params.raw.object[key] = params[key];
        }
    });
};
/*
 * Transform from one type to another
 **/
var transformCreateToUpdate = function (expr) {
    if (!expr.type) {
        // could also improve my types instead.
        throw new Error("Expression type undefined " + expr);
    }
    else {
        return exports.explicitelySetAllParameters(exports.toTaggedExpr(expr, Update(getReference(expr, resourceTypeToFqlReferenceFunction(expr)), expr.fqlExpr.raw["create_" + exports.camelToSnakeCase(expr.type)].raw.object), expressions_1.StatementType.Update));
    }
};
exports.transformCreateToUpdate = transformCreateToUpdate;
var transformCreateToDelete = function (expr) {
    return exports.toTaggedExpr(expr, Delete(getReference(expr, resourceTypeToFqlReferenceFunction(expr))), expressions_1.StatementType.Delete);
};
exports.transformCreateToDelete = transformCreateToDelete;
var transformUpdateToUpdate = function (expr) {
    return exports.explicitelySetAllParameters(expr);
};
exports.transformUpdateToUpdate = transformUpdateToUpdate;
var transformUpdateToDelete = function (expr) {
    return exports.toTaggedExpr(expr, Delete(getReference(expr, resourceTypeToFqlReferenceFunction(expr))), expressions_1.StatementType.Delete);
};
exports.transformUpdateToDelete = transformUpdateToDelete;
var transformDbPathToCreate = function (childDbPath) {
    var name = childDbPath.length > 0 ? childDbPath[childDbPath.length - 1] : '';
    var db = childDbPath.slice(0, -1);
    var createDbFql = CreateDatabase({
        name: name
    });
    return exports.transformDbNameToFqlGeneric(name, db, expressions_1.StatementType.Create, createDbFql);
};
exports.transformDbPathToCreate = transformDbPathToCreate;
var transformDbPathToUpdate = function (childDbPath) {
    // no support for database metadata atm
    var name = childDbPath.length > 0 ? childDbPath[childDbPath.length - 1] : '';
    var db = childDbPath.slice(1);
    var updateDbFql = Update(Database(name), { name: name });
    return exports.transformDbNameToFqlGeneric(name, db, expressions_1.StatementType.Update, updateDbFql);
};
exports.transformDbPathToUpdate = transformDbPathToUpdate;
var transformDbPathToDelete = function (childDbPath) {
    // no support for database metadata atm
    var name = childDbPath.length > 0 ? childDbPath[childDbPath.length - 1] : '';
    var db = childDbPath.slice(1);
    var deleteDbFql = Delete(Database(name));
    return exports.transformDbNameToFqlGeneric(name, db, expressions_1.StatementType.Delete, deleteDbFql);
};
exports.transformDbPathToDelete = transformDbPathToDelete;
var transformDbNameToFqlGeneric = function (name, db, s, fqlExpr) {
    return {
        fqlExpr: fqlExpr,
        fql: fqlExpr.toFQL(),
        name: name,
        jsonData: {},
        type: resource_types_1.ResourceTypes.Database,
        statement: s,
        db: db
    };
};
exports.transformDbNameToFqlGeneric = transformDbNameToFqlGeneric;
var camelToSnakeCase = function (str) {
    var snakeCase = str.replace(/[A-Z]/g, function (letter) { return "_" + letter.toLowerCase(); });
    if (snakeCase.charAt(0) === '_') {
        snakeCase = snakeCase.substring(1, snakeCase.length);
    }
    return snakeCase;
};
exports.camelToSnakeCase = camelToSnakeCase;
var toTaggedExpr = function (taggedExpr, fqlExpr, statement) {
    if (taggedExpr === undefined) {
        throw new Error('toTaggedExpr: received undefined expr');
    }
    else {
        var type = taggedExpr.type;
        var newExpr = {
            name: taggedExpr.name,
            type: type,
            fqlExpr: fqlExpr,
            fql: fqlExpr.toFQL(),
            statement: statement,
            jsonData: exports.getJsonData(fqlExpr, type, statement),
            db: taggedExpr.db
        };
        return newExpr;
    }
};
exports.toTaggedExpr = toTaggedExpr;
var getReference = function (taggedExpr, fqlFunc) {
    return fqlFunc(taggedExpr.name);
};
var resourceTypeToFqlReferenceFunction = function (expr) {
    switch (expr.type) {
        case resource_types_1.ResourceTypes.Collection:
            return Collection;
        case resource_types_1.ResourceTypes.Index:
            return Index;
        case resource_types_1.ResourceTypes.Function:
            return Function;
        case resource_types_1.ResourceTypes.Role:
            return Role;
        case resource_types_1.ResourceTypes.AccessProvider:
            return AccessProvider;
        case resource_types_1.ResourceTypes.Database:
            return Database;
        default:
            throw new Error("Unknown type " + expr.type);
    }
};
var resourceTypeToFqlCreateFunction = function (expr) {
    switch (expr.type) {
        case resource_types_1.ResourceTypes.Collection:
            return CreateCollection;
        case resource_types_1.ResourceTypes.Index:
            return CreateIndex;
        case resource_types_1.ResourceTypes.Function:
            return CreateFunction;
        case resource_types_1.ResourceTypes.Role:
            return CreateRole;
        case resource_types_1.ResourceTypes.AccessProvider:
            return CreateAccessProvider;
        case resource_types_1.ResourceTypes.Database:
            return CreateDatabase;
        default:
            throw new Error("Unknown type " + expr.type);
    }
};
var getJsonData = function (fExpr, resourceType, statement) {
    var expr = fExpr;
    if (statement === expressions_1.StatementType.Create) {
        var key = 'create_' + exports.camelToSnakeCase(resourceType);
        var jsonData = lodash_clonedeep_1.default(expr.raw[key].raw.object);
        delete jsonData.name;
        return jsonData;
    }
    else if (statement === expressions_1.StatementType.Update) {
        var jsonData = expr.raw.params.raw.object;
        delete jsonData.name;
        return jsonData;
    }
    else {
        return {};
    }
};
exports.getJsonData = getJsonData;
