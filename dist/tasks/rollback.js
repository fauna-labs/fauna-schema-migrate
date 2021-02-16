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
var interactive_shell_1 = require("../interactive-shell/interactive-shell");
var diff_1 = require("../migrations/diff");
var rollback_1 = require("../migrations/rollback");
var from_cloud_1 = require("../state/from-cloud");
var fauna_client_1 = require("../util/fauna-client");
var ExpectedNumber_1 = require("../errors/ExpectedNumber");
var rollback = function (amount, atChildDbPath) {
    if (amount === void 0) { amount = 1; }
    if (atChildDbPath === void 0) { atChildDbPath = []; }
    return __awaiter(void 0, void 0, void 0, function () {
        var client, query, cloudMigrations, allCloudMigrations, rMigs, diff, expressions, error_1, missingMigrDescription, schemaDescription, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validateNumber(amount);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 21, , 22]);
                    return [4 /*yield*/, fauna_client_1.clientGenerator.getClient(atChildDbPath)];
                case 2:
                    client = _a.sent();
                    query = null;
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 15, , 20]);
                    interactive_shell_1.interactiveShell.startSubtask("Retrieving current cloud migration state");
                    return [4 /*yield*/, from_cloud_1.retrieveAllCloudMigrations(client)];
                case 4:
                    cloudMigrations = (_a.sent());
                    allCloudMigrations = cloudMigrations.map(function (e) { return e.timestamp; });
                    // Parse parameter
                    if (amount === "all") {
                        amount = cloudMigrations.length;
                    }
                    else if (typeof amount === "string") {
                        amount = parseInt(amount);
                    }
                    return [4 /*yield*/, rollback_1.retrieveRollbackMigrations(cloudMigrations, amount, atChildDbPath)];
                case 5:
                    rMigs = _a.sent();
                    interactive_shell_1.interactiveShell.renderMigrations(allCloudMigrations, rMigs.allLocalMigrations, "rollback", amount);
                    if (!(allCloudMigrations.length === 0)) return [3 /*break*/, 6];
                    interactive_shell_1.interactiveShell.completeSubtask("Done, no migrations to rollback");
                    return [3 /*break*/, 14];
                case 6:
                    if (!(amount >= allCloudMigrations.length && process.env.FAUNA_CHILD_DB)) return [3 /*break*/, 10];
                    interactive_shell_1.interactiveShell.completeSubtask("Retrieved current migration state");
                    interactive_shell_1.interactiveShell.startSubtask("Rolling back all migrations, nuking child database instead");
                    return [4 /*yield*/, fauna_client_1.clientGenerator.destroyChildDb()];
                case 7:
                    _a.sent();
                    interactive_shell_1.interactiveShell.completeSubtask("Nuked child database");
                    interactive_shell_1.interactiveShell.startSubtask("Reinitialising datase & migrations collection");
                    return [4 /*yield*/, fauna_client_1.clientGenerator.getClient([], true)];
                case 8:
                    client = _a.sent();
                    return [4 /*yield*/, from_cloud_1.createMigrationCollection(client)];
                case 9:
                    _a.sent();
                    interactive_shell_1.interactiveShell.completeSubtask("Applied rollback");
                    return [3 /*break*/, 14];
                case 10:
                    interactive_shell_1.interactiveShell.completeSubtask("Retrieved current migration state");
                    interactive_shell_1.interactiveShell.startSubtask("Calculating diff");
                    return [4 /*yield*/, rollback_1.retrieveDiffCurrentTarget(rMigs.toRollback.current, rMigs.toRollback.target, atChildDbPath)];
                case 11:
                    diff = _a.sent();
                    expressions = diff_1.transformDiffToExpressions(diff);
                    interactive_shell_1.interactiveShell.completeSubtask("Calculated diff");
                    interactive_shell_1.interactiveShell.startSubtask("Generating query");
                    return [4 /*yield*/, rollback_1.generateRollbackQuery(expressions, rMigs.toRollback.skipped, rMigs.toRollback.current)];
                case 12:
                    query = _a.sent();
                    interactive_shell_1.interactiveShell.completeSubtask("Generating query");
                    interactive_shell_1.interactiveShell.printBoxedCode(print_1.prettyPrintExpr(query));
                    interactive_shell_1.interactiveShell.startSubtask("Applying rollback");
                    return [4 /*yield*/, client.query(query)];
                case 13:
                    _a.sent();
                    interactive_shell_1.interactiveShell.completeSubtask("Applied rollback");
                    _a.label = 14;
                case 14: return [3 /*break*/, 20];
                case 15:
                    error_1 = _a.sent();
                    missingMigrDescription = detect_errors_1.isMissingMigrationCollectionFaunaError(error_1);
                    if (missingMigrDescription) {
                        return [2 /*return*/, interactive_shell_1.interactiveShell.reportWarning("The migrations collection is missing, \n did you run 'init' first?")];
                    }
                    schemaDescription = detect_errors_1.isSchemaCachingFaunaError(error_1);
                    if (!schemaDescription) return [3 /*break*/, 18];
                    interactive_shell_1.interactiveShell.startSubtask(schemaDescription + "\nWaiting for 60 seconds for cache to clear");
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 60000); })];
                case 16:
                    _a.sent();
                    interactive_shell_1.interactiveShell.startSubtask("Applying rollback");
                    return [4 /*yield*/, client.query(query)];
                case 17:
                    _a.sent();
                    interactive_shell_1.interactiveShell.completeSubtask("Applied rollback");
                    return [3 /*break*/, 19];
                case 18:
                    interactive_shell_1.interactiveShell.reportError(error_1);
                    _a.label = 19;
                case 19: return [3 /*break*/, 20];
                case 20: return [3 /*break*/, 22];
                case 21:
                    error_2 = _a.sent();
                    interactive_shell_1.interactiveShell.reportError(error_2);
                    return [3 /*break*/, 22];
                case 22: return [2 /*return*/];
            }
        });
    });
};
var validateNumber = function (str) {
    if (str !== "all" && (isNaN(str) || isNaN(parseFloat(str)))) {
        throw new ExpectedNumber_1.ExpectedNumberOfMigrations(str);
    }
};
exports.default = rollback;
