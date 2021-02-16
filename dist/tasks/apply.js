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
var detect_errors_1 = require("../errors/detect-errors");
var print_1 = require("../fql/print");
var interactive_shell_1 = require("./../interactive-shell/interactive-shell");
var advance_1 = require("../migrations/advance");
var diff_1 = require("../migrations/diff");
var fauna_client_1 = require("../util/fauna-client");
var ExpectedNumber_1 = require("../errors/ExpectedNumber");
var apply = function (amount, atChildDbPath) {
    if (amount === void 0) { amount = 1; }
    if (atChildDbPath === void 0) { atChildDbPath = []; }
    return __awaiter(void 0, void 0, void 0, function () {
        var client, query, migInfo, maxAmount, allCloudMigrationTimestamps, currTargetSkipped, databaseDiff, dbName, diff, expressions, error_1, missingMigrDescription, schemaDescription, dbName, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validateNumber(amount);
                    return [4 /*yield*/, fauna_client_1.clientGenerator.getClient(atChildDbPath)];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 18, , 19]);
                    query = null;
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 12, , 17]);
                    return [4 /*yield*/, advance_1.retrieveMigrationInfo(client, atChildDbPath)
                        // Parse parameter
                    ];
                case 4:
                    migInfo = _a.sent();
                    maxAmount = migInfo.allLocalMigrations.length - migInfo.allCloudMigrations.length;
                    if (amount === "all") {
                        amount = maxAmount;
                    }
                    else if (typeof amount === "string") {
                        amount = parseInt(amount);
                    }
                    amount = Math.min(amount, maxAmount);
                    // Get info on current state.
                    interactive_shell_1.interactiveShell.startSubtask("Retrieving current cloud migration state");
                    allCloudMigrationTimestamps = migInfo.allCloudMigrations.map(function (e) { return e.timestamp; });
                    interactive_shell_1.interactiveShell.completeSubtask("Retrieved current migration state");
                    if (!(migInfo.allCloudMigrations.length < migInfo.allLocalMigrations.length)) return [3 /*break*/, 10];
                    return [4 /*yield*/, advance_1.getCurrentAndTargetMigration(migInfo.allLocalMigrations, migInfo.allCloudMigrations, amount)];
                case 5:
                    currTargetSkipped = _a.sent();
                    return [4 /*yield*/, advance_1.retrieveDatabaseMigrationInfo(currTargetSkipped.current, currTargetSkipped.target)];
                case 6:
                    databaseDiff = _a.sent();
                    dbName = atChildDbPath.length > 0 ? "[ DB: ROOT > " + atChildDbPath.join(' > ') + " ]" : '[ DB: ROOT ]';
                    interactive_shell_1.interactiveShell.renderMigrations(allCloudMigrationTimestamps, migInfo.allLocalMigrations, "apply", amount);
                    interactive_shell_1.interactiveShell.startSubtask(dbName + " Generate migration code");
                    return [4 /*yield*/, advance_1.retrieveDiffCurrentTarget(atChildDbPath, currTargetSkipped.current, currTargetSkipped.target)];
                case 7:
                    diff = _a.sent();
                    expressions = diff_1.transformDiffToExpressions(diff);
                    return [4 /*yield*/, advance_1.generateApplyQuery(expressions, currTargetSkipped.skipped, currTargetSkipped.target)];
                case 8:
                    query = _a.sent();
                    interactive_shell_1.interactiveShell.completeSubtask(dbName + " Generated migration code");
                    interactive_shell_1.interactiveShell.printBoxedCode(print_1.prettyPrintExpr(query));
                    interactive_shell_1.interactiveShell.startSubtask(dbName + " Applying migration");
                    return [4 /*yield*/, client.query(query)];
                case 9:
                    _a.sent();
                    interactive_shell_1.interactiveShell.completeSubtask("Done applying migrations");
                    return [3 /*break*/, 11];
                case 10:
                    interactive_shell_1.interactiveShell.completeSubtask("Done, no migrations to apply");
                    _a.label = 11;
                case 11: return [3 /*break*/, 17];
                case 12:
                    error_1 = _a.sent();
                    missingMigrDescription = detect_errors_1.isMissingMigrationCollectionFaunaError(error_1);
                    if (missingMigrDescription) {
                        return [2 /*return*/, interactive_shell_1.interactiveShell.reportWarning("The migrations collection is missing, \n did you run 'init' first?")];
                    }
                    schemaDescription = detect_errors_1.isSchemaCachingFaunaError(error_1);
                    if (!schemaDescription) return [3 /*break*/, 15];
                    dbName = atChildDbPath.length > 0 ? "[ DB: ROOT > " + atChildDbPath.join(' > ') + " ]" : '[ DB: ROOT ]';
                    interactive_shell_1.interactiveShell.startSubtask(dbName + " " + schemaDescription + "\nWaiting for 60 seconds for cache to clear");
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 60000); })];
                case 13:
                    _a.sent();
                    interactive_shell_1.interactiveShell.startSubtask(dbName + " Applying migration");
                    return [4 /*yield*/, client.query(query)];
                case 14:
                    _a.sent();
                    return [2 /*return*/, interactive_shell_1.interactiveShell.completeSubtask("Applied migration")];
                case 15:
                    interactive_shell_1.interactiveShell.reportError(error_1);
                    _a.label = 16;
                case 16: return [3 /*break*/, 17];
                case 17: return [3 /*break*/, 19];
                case 18:
                    error_2 = _a.sent();
                    interactive_shell_1.interactiveShell.reportError(error_2);
                    return [3 /*break*/, 19];
                case 19: return [2 /*return*/];
            }
        });
    });
};
var validateNumber = function (str) {
    if (str !== "all" && (isNaN(str) || isNaN(parseFloat(str)))) {
        throw new ExpectedNumber_1.ExpectedNumberOfMigrations(str);
    }
};
exports.default = apply;
