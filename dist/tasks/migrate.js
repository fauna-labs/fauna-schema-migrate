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
var equalDeep = require('deep-equal');
var plan_1 = require("../migrations/plan");
var generate_migration_1 = require("../migrations/generate-migration");
var interactive_shell_1 = require("../interactive-shell/interactive-shell");
var migrate = function () { return __awaiter(void 0, void 0, void 0, function () {
    var time, databaseDiff, childDbExprs, _i, databaseDiff_1, dbExpr, childPath, childDbExprs_1, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                time = new Date().toISOString();
                return [4 /*yield*/, plan_1.planDatabaseMigrations()
                    // Migrate the root db
                ];
            case 1:
                databaseDiff = _a.sent();
                childDbExprs = findChildDatabaseExpressions([], databaseDiff);
                return [4 /*yield*/, migrateOneDb([], databaseDiff.length > 0, time, childDbExprs)
                    // Then migrate the children
                ];
            case 2:
                _a.sent();
                _i = 0, databaseDiff_1 = databaseDiff;
                _a.label = 3;
            case 3:
                if (!(_i < databaseDiff_1.length)) return [3 /*break*/, 6];
                dbExpr = databaseDiff_1[_i];
                childPath = dbExpr.db.concat([dbExpr.name]);
                childDbExprs_1 = findChildDatabaseExpressions(childPath, databaseDiff);
                return [4 /*yield*/, migrateOneDb(childPath, true, time, childDbExprs_1)];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6: return [3 /*break*/, 8];
            case 7:
                error_1 = _a.sent();
                interactive_shell_1.interactiveShell.reportError(error_1);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
var migrateOneDb = function (atChildDbPath, multipleDbs, time, dbExprs) { return __awaiter(void 0, void 0, void 0, function () {
    var dbName, planned, migrations, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                dbName = '';
                if (multipleDbs) {
                    dbName = atChildDbPath.length > 0 ? "[ DB: ROOT > " + atChildDbPath.join(' > ') + " ]" : '[ DB: ROOT ]';
                }
                interactive_shell_1.interactiveShell.startSubtask(dbName + " Planning Migrations");
                return [4 /*yield*/, plan_1.planMigrations(atChildDbPath, dbExprs)];
            case 1:
                planned = _a.sent();
                interactive_shell_1.interactiveShell.completeSubtask(dbName + " Planned Migrations");
                interactive_shell_1.interactiveShell.startSubtask(dbName + " Generating Migrations");
                return [4 /*yield*/, generate_migration_1.generateMigrations(planned)];
            case 2:
                migrations = _a.sent();
                interactive_shell_1.interactiveShell.completeSubtask(dbName + " Generated Migrations");
                if (!(migrations.length === 0)) return [3 /*break*/, 3];
                interactive_shell_1.interactiveShell.reportWarning("There is no difference, nothing to write");
                return [3 /*break*/, 5];
            case 3:
                interactive_shell_1.interactiveShell.renderPlan(planned);
                interactive_shell_1.interactiveShell.startSubtask(dbName + " Write migrations");
                return [4 /*yield*/, generate_migration_1.writeMigrations(atChildDbPath, migrations, time)];
            case 4:
                _a.sent();
                interactive_shell_1.interactiveShell.completeSubtask(dbName + " Written migrations");
                _a.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                error_2 = _a.sent();
                interactive_shell_1.interactiveShell.reportError(error_2);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
// Filters arrays out that have the prefix and only have
// one element left after removing the prefix.
var findChildDatabaseExpressions = function (db, databaseDiff) {
    var prefix = db;
    return databaseDiff.filter(function (expr) {
        var childPath = expr.db.concat([expr.name]);
        return childPath.length == prefix.length + 1 && equalDeep(childPath.slice(0, prefix.length), prefix);
    });
};
exports.default = migrate;
