"use strict";
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
exports.getAllLastMigrationSnippets = exports.getAllLastDatabases = void 0;
var files_1 = require("../util/files");
var match_1 = require("../fql/match");
var expressions_1 = require("../types/expressions");
var resource_types_1 = require("../types/resource-types");
var unique_naming_1 = require("../util/unique-naming");
var DuplicateMigrationError_1 = require("../errors/DuplicateMigrationError");
var config_1 = require("../util/config");
var getAllLastDatabases = function (before, ignoreChildDb) {
    if (before === void 0) { before = null; }
    if (ignoreChildDb === void 0) { ignoreChildDb = true; }
    return __awaiter(void 0, void 0, void 0, function () {
        var snippets;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.getAllLastMigrationSnippets([], before, ignoreChildDb)];
                case 1:
                    snippets = _a.sent();
                    return [2 /*return*/, transformMigrationsToDbPaths(snippets.migrations.Database)];
            }
        });
    });
};
exports.getAllLastDatabases = getAllLastDatabases;
var transformMigrationsToDbPaths = function (dbMigrations) {
    return dbMigrations
        .filter((function (migExpr) { return migExpr.statement !== expressions_1.StatementType.Delete; }))
        .map(function (migExpr) { return migExpr.db.concat([migExpr.name]); });
};
// This will get All migrations but only retain the last version
// of the migration for each type and name.
// this is in stark contrast with getSnippetsFromLastMigration
var getAllLastMigrationSnippets = function (atChildDbPath, before, ignoreChildDb) {
    if (atChildDbPath === void 0) { atChildDbPath = []; }
    if (before === void 0) { before = null; }
    if (ignoreChildDb === void 0) { ignoreChildDb = true; }
    return __awaiter(void 0, void 0, void 0, function () {
        var childDbName, pathsAndFiles, lastMigration, _loop_1, i, pathsAndExpressions, latestByNameAndType, previousVersionsByDbNameAndType, categories, item;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, config_1.config.getChildDbsDirName()
                    // Retrieve all migration folders and their files.
                    // the return value is an ordered array containin the
                    // migration and the file paths.
                ];
                case 1:
                    childDbName = _a.sent();
                    pathsAndFiles = [];
                    return [4 /*yield*/, files_1.retrieveLastMigrationVersionAndPathsForMigrationBefore(atChildDbPath, before, ignoreChildDb)];
                case 2:
                    // sort on migration to be certain.
                    pathsAndFiles = _a.sent();
                    pathsAndFiles.sort(function (a, b) { return (a.migration > b.migration) ? 1 : ((b.migration > a.migration) ? -1 : 0); });
                    lastMigration = pathsAndFiles.length > 0 ? pathsAndFiles[pathsAndFiles.length - 1].migration : "0";
                    _loop_1 = function (i) {
                        var pathAndfile, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    pathAndfile = pathsAndFiles[i];
                                    _a = pathAndfile;
                                    return [4 /*yield*/, Promise.all(pathAndfile.files.map(function (f) { return __awaiter(void 0, void 0, void 0, function () {
                                            var snippet;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, files_1.loadFqlSnippet(f)];
                                                    case 1:
                                                        snippet = _a.sent();
                                                        return [2 /*return*/, {
                                                                fqlExpr: snippet,
                                                                fql: snippet.toFQL(),
                                                                name: '',
                                                                jsonData: {},
                                                                migration: pathAndfile.migration,
                                                                previousVersions: [],
                                                                db: files_1.filePathToDatabase(childDbName, f)
                                                            }];
                                                }
                                            });
                                        }); }))];
                                case 1:
                                    _a.expressions = _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < pathsAndFiles.length)) return [3 /*break*/, 6];
                    return [5 /*yield**/, _loop_1(i)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6:
                    pathsAndExpressions = pathsAndFiles;
                    latestByNameAndType = {};
                    previousVersionsByDbNameAndType = {};
                    pathsAndExpressions.forEach(function (pathAndExpressions) {
                        match_1.addNamesAndTypes(pathAndExpressions.expressions);
                        pathAndExpressions.expressions.forEach(function (expr) {
                            var key = unique_naming_1.toIndexableNameWithDb(expr);
                            // If there is already an expression for this name and
                            // it was present in the same migration, error, that shouldn't happen.
                            if (latestByNameAndType[key] && latestByNameAndType[key].migration === expr.migration) {
                                throw new DuplicateMigrationError_1.DuplicateMigrationError(expr);
                            }
                            // We do not include Delete statements in the 'last version'.
                            // the result of this function is only Create/Delete statements.
                            if (expr.statement === expressions_1.StatementType.Delete) {
                                previousVersionsByDbNameAndType[key] = [];
                                delete latestByNameAndType[key];
                            }
                            // Else, just override, pathsAndExpressions are ordered.
                            // That way we get the latest migrations.
                            else if (latestByNameAndType[key]) {
                                if (!previousVersionsByDbNameAndType[key]) {
                                    previousVersionsByDbNameAndType[key] = [];
                                }
                                previousVersionsByDbNameAndType[key].push(latestByNameAndType[key]);
                                latestByNameAndType[key] = expr;
                            }
                            else {
                                latestByNameAndType[key] = expr;
                            }
                        });
                    });
                    categories = {};
                    for (item in resource_types_1.ResourceTypes) {
                        categories[item] = [];
                    }
                    Object.keys(latestByNameAndType).forEach(function (key) {
                        var latestExpression = latestByNameAndType[key];
                        // Deletes are only useful information if they are the last migration.
                        // else we can just ignore the migration.
                        if (latestExpression.statement !== expressions_1.StatementType.Delete || latestExpression.migration === lastMigration) {
                            categories[latestExpression.type].push(latestExpression);
                        }
                        latestExpression.previousVersions = previousVersionsByDbNameAndType[key] ?
                            previousVersionsByDbNameAndType[key].reverse() : [];
                    });
                    return [2 /*return*/, { lastMigration: lastMigration, migrations: categories }];
            }
        });
    });
};
exports.getAllLastMigrationSnippets = getAllLastMigrationSnippets;
