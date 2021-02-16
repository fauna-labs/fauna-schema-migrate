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
exports.generateApplyQuery = exports.retrieveDiffCurrentTarget = exports.getCurrentAndTargetMigration = exports.retrieveMigrationInfo = exports.retrieveDatabaseMigrationInfo = void 0;
var from_migration_files_1 = require("../state/from-migration-files");
var expressions_1 = require("../types/expressions");
var resource_types_1 = require("../types/resource-types");
var fauna = __importStar(require("faunadb"));
var config_1 = require("../util/config");
var generate_query_1 = require("./generate-query");
var transform_1 = require("../fql/transform");
var files_1 = require("../util/files");
var diff_1 = require("./diff");
var from_cloud_1 = require("../state/from-cloud");
var q = fauna.query;
var Let = q.Let, Create = q.Create, Collection = q.Collection, Lambda = q.Lambda;
var retrieveDatabaseMigrationInfo = function (currentMigration, targetMigration) { return __awaiter(void 0, void 0, void 0, function () {
    var allCurrentMigrationChildDbs, allTargetMigrationChildDbs, dbDiff;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, from_migration_files_1.getAllLastDatabases(currentMigration === null || currentMigration === void 0 ? void 0 : currentMigration.timestamp, false)];
            case 1:
                allCurrentMigrationChildDbs = _a.sent();
                return [4 /*yield*/, from_migration_files_1.getAllLastDatabases(targetMigration, false)
                    // They should be sorted according to the length of the child db path.
                ];
            case 2:
                allTargetMigrationChildDbs = _a.sent();
                return [4 /*yield*/, diff_1.retrieveDatabasesDiff(allCurrentMigrationChildDbs, allTargetMigrationChildDbs)];
            case 3:
                dbDiff = _a.sent();
                dbDiff.sort(function (a, b) { return a.db.length >= b.db.length ? 1 : -1; });
                return [2 /*return*/, dbDiff];
        }
    });
}); };
exports.retrieveDatabaseMigrationInfo = retrieveDatabaseMigrationInfo;
var retrieveMigrationInfo = function (client, atChildDbPath) {
    if (atChildDbPath === void 0) { atChildDbPath = []; }
    return __awaiter(void 0, void 0, void 0, function () {
        var allCloudMigrations, allLocalMigrations;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, from_cloud_1.retrieveAllCloudMigrations(client)];
                case 1:
                    allCloudMigrations = (_a.sent());
                    return [4 /*yield*/, files_1.retrieveAllMigrations(atChildDbPath)];
                case 2:
                    allLocalMigrations = _a.sent();
                    return [2 /*return*/, {
                            allCloudMigrations: allCloudMigrations,
                            allLocalMigrations: allLocalMigrations
                        }];
            }
        });
    });
};
exports.retrieveMigrationInfo = retrieveMigrationInfo;
var getCurrentAndTargetMigration = function (localMigrations, cloudMigrations, amount) { return __awaiter(void 0, void 0, void 0, function () {
    var currentMigration, applyToIndex, targetMigration, skippedMigrations;
    return __generator(this, function (_a) {
        currentMigration = cloudMigrations.length > 0 ? cloudMigrations[cloudMigrations.length - 1] : null;
        applyToIndex = (cloudMigrations.length - 1) + amount;
        targetMigration = applyToIndex < localMigrations.length ? localMigrations[applyToIndex] : null;
        if (!targetMigration) {
            throw new Error('Asked for apply but there are no migrations to apply anymore');
        }
        skippedMigrations = localMigrations.slice(cloudMigrations.length, applyToIndex);
        return [2 /*return*/, { current: currentMigration, target: targetMigration, skipped: skippedMigrations }];
    });
}); };
exports.getCurrentAndTargetMigration = getCurrentAndTargetMigration;
var retrieveDiffCurrentTarget = function (atChildDbPath, currentMigration, targetMigration) { return __awaiter(void 0, void 0, void 0, function () {
    var appliedMigrations, toApplyMigrations, diff;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getAppliedMigrations(atChildDbPath, currentMigration)];
            case 1:
                appliedMigrations = _a.sent();
                return [4 /*yield*/, from_migration_files_1.getAllLastMigrationSnippets(atChildDbPath, targetMigration)];
            case 2:
                toApplyMigrations = (_a.sent()).migrations;
                diff = diff_1.retrieveDiff(appliedMigrations, toApplyMigrations);
                return [2 /*return*/, diff];
        }
    });
}); };
exports.retrieveDiffCurrentTarget = retrieveDiffCurrentTarget;
var getAppliedMigrations = function (atChildDbPath, currentMigration) { return __awaiter(void 0, void 0, void 0, function () {
    var currentMigrations, categories, item;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!currentMigration) return [3 /*break*/, 2];
                return [4 /*yield*/, from_migration_files_1.getAllLastMigrationSnippets(atChildDbPath, currentMigration.timestamp)];
            case 1:
                currentMigrations = (_a.sent()).migrations;
                return [2 /*return*/, currentMigrations];
            case 2:
                categories = {};
                for (item in resource_types_1.ResourceTypes) {
                    categories[item] = [];
                }
                return [2 /*return*/, categories];
        }
    });
}); };
var generateApplyQuery = function (expressions, skippedMigrations, targetMigration) { return __awaiter(void 0, void 0, void 0, function () {
    var letQueryObject, migrCollection, migrationCreateStatements, query;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                expressions = fixUpdates(expressions);
                return [4 /*yield*/, generate_query_1.generateMigrationQuery(expressions)];
            case 1:
                letQueryObject = _a.sent();
                return [4 /*yield*/, config_1.config.getMigrationCollection()];
            case 2:
                migrCollection = _a.sent();
                migrationCreateStatements = skippedMigrations.concat([targetMigration]);
                query = Let(
                // add all statements as Let variable bindings
                letQueryObject, 
                // add the migration documents
                q.Map(migrationCreateStatements, Lambda(function (migration) { return Create(Collection(migrCollection), { data: { migration: migration } }); })));
                return [2 /*return*/, query];
        }
    });
}); };
exports.generateApplyQuery = generateApplyQuery;
var getMigrationMetadata = function (migrationcategories) {
    var migrationMetaData = {};
    Object.keys(migrationcategories).forEach(function (key) {
        var migrations = migrationcategories[key];
        var metadata = migrations.map(function (m) {
            return {
                name: m.name, type: m.type
            };
        });
        migrationMetaData[key] = metadata;
    });
    return migrationMetaData;
};
var flattenMigrations = function (migrationsPerType) {
    var grouped = [];
    Object.keys(migrationsPerType).forEach(function (typeStr) {
        var type = resource_types_1.ResourceTypes[typeStr];
        var migrations = migrationsPerType[type];
        grouped.push(migrations);
    });
    var flattened = grouped.flat();
    return flattened;
};
// Updates only update the explicitely mentioned keys. To be certain
// we have to fill in all the keys for a given type with key: null.
var fixUpdates = function (expressions) {
    return expressions.map(function (e) {
        if (e.statement === expressions_1.StatementType.Update) {
            return transform_1.transformUpdateToUpdate(e);
        }
        else {
            return e;
        }
    });
};
