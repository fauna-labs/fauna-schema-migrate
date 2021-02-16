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
exports.retrieveDiffCurrentTarget = exports.generateRollbackQuery = exports.retrieveRollbackMigrations = void 0;
var fauna = __importStar(require("faunadb"));
var from_migration_files_1 = require("../state/from-migration-files");
var resource_types_1 = require("../types/resource-types");
var generate_query_1 = require("./generate-query");
var files_1 = require("../util/files");
var diff_1 = require("./diff");
var q = fauna.query;
var _a = fauna.query, Let = _a.Let, Lambda = _a.Lambda, Delete = _a.Delete;
var retrieveRollbackMigrations = function (cloudMigrations, amount, atChildDbPath) { return __awaiter(void 0, void 0, void 0, function () {
    var allMigrations, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, files_1.retrieveAllMigrations(atChildDbPath)];
            case 1:
                allMigrations = _a.sent();
                return [4 /*yield*/, getCurrentAndTargetMigration(cloudMigrations, amount)];
            case 2:
                res = _a.sent();
                return [2 /*return*/, { allLocalMigrations: allMigrations, toRollback: res }];
        }
    });
}); };
exports.retrieveRollbackMigrations = retrieveRollbackMigrations;
var generateRollbackQuery = function (expressions, skippedMigrations, currentMigration) { return __awaiter(void 0, void 0, void 0, function () {
    var letQueryObject, toDeleteReferences, query;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, generate_query_1.generateMigrationQuery(expressions)];
            case 1:
                letQueryObject = _a.sent();
                toDeleteReferences = skippedMigrations.concat([currentMigration])
                    .map(function (e) { return e.ref; });
                query = Let(
                // add all statements as Let variable bindings
                letQueryObject, q.Map(toDeleteReferences, Lambda(function (ref) { return Delete(ref); })));
                return [2 /*return*/, query];
        }
    });
}); };
exports.generateRollbackQuery = generateRollbackQuery;
var getCurrentAndTargetMigration = function (cloudMigrations, amount) { return __awaiter(void 0, void 0, void 0, function () {
    var currentMigration, rollbackToIndex, targetMigration, skippedMigrations;
    return __generator(this, function (_a) {
        currentMigration = cloudMigrations.length > 0 ? cloudMigrations[cloudMigrations.length - 1] : null;
        if (!currentMigration) {
            throw new Error('Asked for rollback but the target database has no migrations');
        }
        rollbackToIndex = cloudMigrations.length - 1 - amount;
        targetMigration = rollbackToIndex < cloudMigrations.length ? cloudMigrations[rollbackToIndex] : null;
        skippedMigrations = cloudMigrations.slice(rollbackToIndex + 1, cloudMigrations.length - 1);
        return [2 /*return*/, { current: currentMigration, target: targetMigration, skipped: skippedMigrations }];
    });
}); };
var retrieveDiffCurrentTarget = function (currentMigration, targetMigration, atChildPath) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, currentMigrations, currentLastMigration, targetMigrations, diff;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, from_migration_files_1.getAllLastMigrationSnippets(atChildPath, currentMigration.timestamp)];
            case 1:
                _a = _b.sent(), currentMigrations = _a.migrations, currentLastMigration = _a.lastMigration;
                return [4 /*yield*/, getTargetMigrations(targetMigration, atChildPath)
                    // We need to calculate the diff. But we already have such a function
                    // which we used to plan migrations.
                    // we can consider the previousMigrations as the new source of truth (we have to go there)
                    // while currentMigrations is the migration state we have to move forward from.
                    // or in this case backward since it's a rollback.
                    // In essence, previousMigrations is equivalent to the 'resources' now
                    // while currentMigrations are the 'migrations'.
                ];
            case 2:
                targetMigrations = _b.sent();
                diff = diff_1.retrieveDiff(currentMigrations, targetMigrations);
                return [2 /*return*/, diff];
        }
    });
}); };
exports.retrieveDiffCurrentTarget = retrieveDiffCurrentTarget;
var getTargetMigrations = function (targetMigration, atChildPath) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, previousMigrations, previousLastMigration, categories, item;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!targetMigration) return [3 /*break*/, 2];
                return [4 /*yield*/, from_migration_files_1.getAllLastMigrationSnippets(atChildPath, targetMigration.timestamp)
                    // just to be clear these vars should be the same.
                ];
            case 1:
                _a = _b.sent(), previousMigrations = _a.migrations, previousLastMigration = _a.lastMigration;
                // just to be clear these vars should be the same.
                if (previousLastMigration !== targetMigration.timestamp) {
                    throw Error("did not receive the same migration,\n                    rollbackMigration should be equal to previousLastMigration\n                    " + previousLastMigration + ", " + targetMigration.timestamp + "\n                ");
                }
                return [2 /*return*/, previousMigrations];
            case 2:
                categories = {};
                for (item in resource_types_1.ResourceTypes) {
                    categories[item] = [];
                }
                return [2 /*return*/, categories];
        }
    });
}); };
