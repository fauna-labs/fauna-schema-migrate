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
exports.planMigrations = exports.planDatabaseMigrations = void 0;
var from_resource_files_1 = require("../state/from-resource-files");
var from_migration_files_1 = require("../state/from-migration-files");
var resource_types_1 = require("../types/resource-types");
var json_1 = require("../fql/json");
var unique_naming_1 = require("../util/unique-naming");
var UndefinedReferenceError_1 = require("../errors/UndefinedReferenceError");
var transform_1 = require("../fql/transform");
var diff_1 = require("./diff");
var files_1 = require("../util/files");
var planDatabaseMigrations = function () { return __awaiter(void 0, void 0, void 0, function () {
    var allResourceChildDbs, allMigrationChildDbs, dbDiff;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, files_1.retrieveAllResourceChildDb([])];
            case 1:
                allResourceChildDbs = _a.sent();
                return [4 /*yield*/, from_migration_files_1.getAllLastDatabases(null, false)
                    // They should be sorted according to the length of the child db path.
                ];
            case 2:
                allMigrationChildDbs = _a.sent();
                return [4 /*yield*/, diff_1.retrieveDatabasesDiff(allMigrationChildDbs, allResourceChildDbs)];
            case 3:
                dbDiff = _a.sent();
                dbDiff.sort(function (a, b) { return a.db.length >= b.db.length ? 1 : -1; });
                return [2 /*return*/, dbDiff];
        }
    });
}); };
exports.planDatabaseMigrations = planDatabaseMigrations;
var planMigrations = function (atChildDbPath, extraDbExpr) {
    if (atChildDbPath === void 0) { atChildDbPath = []; }
    if (extraDbExpr === void 0) { extraDbExpr = []; }
    return __awaiter(void 0, void 0, void 0, function () {
        var resources, migrations;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, from_resource_files_1.getAllResourceSnippets(atChildDbPath)];
                case 1:
                    resources = _a.sent();
                    extraDbExpr.forEach(function (e) {
                        resources[e.type].push(e);
                    });
                    // IGNORE for now, illegal references is not something that can easily be verified.
                    findIllegalReferences(resources);
                    return [4 /*yield*/, from_migration_files_1.getAllLastMigrationSnippets(atChildDbPath)
                        // Resources determine how your current data looks.
                        // Migraitons are generated from resources.
                        // A diff between migrations means comparing the Resources that exist with
                        // the last seen migration of a certain resource.
                    ];
                case 2:
                    migrations = (_a.sent()).migrations;
                    // Resources determine how your current data looks.
                    // Migraitons are generated from resources.
                    // A diff between migrations means comparing the Resources that exist with
                    // the last seen migration of a certain resource.
                    return [2 /*return*/, diff_1.retrieveDiff(migrations, resources)];
            }
        });
    });
};
exports.planMigrations = planMigrations;
var findIllegalReferences = function (resourcesFQL) {
    var allReferences = findAllReferences(resourcesFQL);
    var _loop_1 = function (resourceType) {
        var referencesForType = allReferences[resourceType];
        var resourcesForType = resourcesFQL[resourceType];
        var resourceByName = {};
        resourcesForType.forEach(function (e) {
            resourceByName[unique_naming_1.toIndexableName(e)] = e;
        });
        referencesForType.forEach(function (ref) {
            var expr = resourceByName[ref.indexableName];
            if (!expr) {
                throw new UndefinedReferenceError_1.UndefinedReferenceError(ref);
            }
        });
    };
    for (var resourceType in resource_types_1.ResourceTypes) {
        _loop_1(resourceType);
    }
};
var findAllReferences = function (resourcesFQL) {
    var categories = {};
    for (var item in resource_types_1.ResourceTypes) {
        categories[item] = [];
    }
    var _loop_2 = function (referenceType) {
        var snakeCaseItem = transform_1.camelToSnakeCase(referenceType);
        // create a strucure of the form { index: { index: ... }}
        var structure = {};
        structure["raw"] = {};
        structure["raw"][snakeCaseItem] = '*'; // value doesn't matter.
        // search in all resources
        for (var resourceType in resource_types_1.ResourceTypes) {
            resourcesFQL[resourceType].forEach(function (res) {
                var structures = json_1.findStructure(structure, res.fqlExpr);
                var namesAndTypes = structures.map(function (e) {
                    return {
                        type: referenceType,
                        name: e.raw[snakeCaseItem],
                        indexableName: unique_naming_1.toIndexableNameFromTypeAndName(referenceType, e.raw[snakeCaseItem]),
                        resource: res
                    };
                });
                categories[referenceType] = categories[referenceType].concat(namesAndTypes);
            });
        }
    };
    for (var referenceType in resource_types_1.ResourceTypes) {
        _loop_2(referenceType);
    }
    return categories;
};
