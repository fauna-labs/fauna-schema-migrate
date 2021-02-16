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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCloudResources = exports.retrieveAllCloudMigrations = exports.createMigrationCollection = void 0;
var cloneDeep = require('lodash.clonedeep');
var fauna = __importStar(require("faunadb"));
var resource_types_1 = require("../types/resource-types");
var config_1 = require("../util/config");
var q = fauna.query;
var Paginate = q.Paginate, Var = q.Var, Roles = q.Roles, Lambda = q.Lambda, Collections = q.Collections, Get = q.Get, Indexes = q.Indexes, Databases = q.Databases, Functions = q.Functions, AccessProviders = q.AccessProviders, Exists = q.Exists, If = q.If, CreateCollection = q.CreateCollection, Collection = q.Collection, Reverse = q.Reverse, Documents = q.Documents, Let = q.Let, Select = q.Select;
var batchSize = 100;
var createQuery = function (name) {
    return CreateCollection({ name: name });
};
var wrapInCreate = function (fetchQuery, name) {
    return If(Exists(Collection(name)), fetchQuery(Collection(name)), Let({
        col: createQuery(name),
        ref: Select(['ref'], Var('col'))
    }, fetchQuery(Var('ref'))));
};
var createMigrationCollection = function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var name, _a, _b, _c, _d, _e;
    var _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0: return [4 /*yield*/, config_1.config.getMigrationCollection()];
            case 1:
                name = _g.sent();
                _b = (_a = client).query;
                _c = If;
                _d = [Exists(Collection(name)),
                    false];
                _e = CreateCollection;
                _f = {};
                return [4 /*yield*/, config_1.config.getMigrationCollection()];
            case 2: return [4 /*yield*/, _b.apply(_a, [_c.apply(void 0, _d.concat([_e.apply(void 0, [(_f.name = _g.sent(), _f)])]))])];
            case 3: return [2 /*return*/, _g.sent()];
        }
    });
}); };
exports.createMigrationCollection = createMigrationCollection;
var retrieveAllCloudMigrations = function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var name, fetchQuery, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, config_1.config.getMigrationCollection()];
            case 1:
                name = _a.sent();
                fetchQuery = function (collectionRef) { return Let({
                    setref: Documents(collectionRef)
                }, q.Map(Paginate(Var('setref'), { size: 10000 }), Lambda(function (x) { return Get(x); }))); };
                return [4 /*yield*/, client.query(wrapInCreate(fetchQuery, name))
                    // we only need the timestamps and refs
                ];
            case 2:
                res = _a.sent();
                // we only need the timestamps and refs
                if (res) {
                    return [2 /*return*/, res.data.map(function (e) {
                            return {
                                timestamp: e.data.migration,
                                ref: e.ref
                            };
                        }).sort(function (a, b) { return a.timestamp > b.timestamp ? 1 : -1; })];
                }
                return [2 /*return*/, res];
        }
    });
}); };
exports.retrieveAllCloudMigrations = retrieveAllCloudMigrations;
var getAllCloudResources = function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var cloudResources, _a, _b, _c, categories, item;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _b = (_a = Promise).all;
                return [4 /*yield*/, getAllResourcesOfType(client, resource_types_1.ResourceTypes.Collection, Collections, remoteTsAndRef)];
            case 1:
                _c = [
                    _d.sent()
                ];
                return [4 /*yield*/, getAllResourcesOfType(client, resource_types_1.ResourceTypes.Index, Indexes, remoteTsAndRef)];
            case 2:
                _c = _c.concat([
                    _d.sent()
                ]);
                return [4 /*yield*/, getAllResourcesOfType(client, resource_types_1.ResourceTypes.Role, Roles, remoteTsAndRef)];
            case 3:
                _c = _c.concat([
                    _d.sent()
                ]);
                return [4 /*yield*/, getAllResourcesOfType(client, resource_types_1.ResourceTypes.Function, Functions, remoteTsAndRef)];
            case 4:
                _c = _c.concat([
                    _d.sent()
                ]);
                return [4 /*yield*/, getAllResourcesOfType(client, resource_types_1.ResourceTypes.AccessProvider, AccessProviders, remoteTsAndRef)];
            case 5:
                _c = _c.concat([
                    _d.sent()
                ]);
                return [4 /*yield*/, getAllResourcesOfType(client, resource_types_1.ResourceTypes.Database, Databases, remoteTsAndRef)];
            case 6: return [4 /*yield*/, _b.apply(_a, [_c.concat([
                        _d.sent()
                    ])])];
            case 7:
                cloudResources = _d.sent();
                categories = {};
                for (item in resource_types_1.ResourceTypes) {
                    categories[item] = [];
                }
                cloudResources.forEach(function (snippets) {
                    snippets.forEach(function (s) {
                        categories[s.type].push(s);
                    });
                });
                return [2 /*return*/, categories];
        }
    });
}); };
exports.getAllCloudResources = getAllCloudResources;
// Transform the roles, you don't need ts or ref.
// We need it to be close to what we receive locally and therefore
// remove generated fields.
var remoteTsAndRef = function (expr) {
    var clone = cloneDeep(expr);
    delete clone.ts;
    delete clone.ref;
    return clone;
};
var getAllResourcesOfType = function (client, type, fqlFun, transformFun) { return __awaiter(void 0, void 0, void 0, function () {
    var fqlQuery, resources;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fqlQuery = function (cursor) { return q.Map(Paginate(fqlFun(), { size: batchSize, after: cursor }), Lambda('x', Get(Var('x')))); };
                return [4 /*yield*/, getAllResourcesWithFun(client, fqlQuery)];
            case 1:
                resources = _a.sent();
                return [2 /*return*/, resources.map(function (el) {
                        return { name: el.name, jsonData: transformFun(el), type: type };
                    })];
        }
    });
}); };
var getAllResourcesWithFun = function (client, fqlFun) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getAllResourcesWithFunRec(client, fqlFun)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var getAllResourcesWithFunRec = function (client, fqlFun, cursor) { return __awaiter(void 0, void 0, void 0, function () {
    var res, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, client.query(fqlFun(cursor))];
            case 1:
                res = _c.sent();
                if (!res.after) return [3 /*break*/, 3];
                _b = (_a = res.data).concat;
                return [4 /*yield*/, getAllResourcesWithFunRec(client, fqlFun, res.after)];
            case 2: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
            case 3: return [2 /*return*/, res.data];
        }
    });
}); };
