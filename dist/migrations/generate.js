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
exports.generateMigrations = exports.writeMigrations = void 0;
var expressions_1 = require("../types/expressions");
var files_1 = require("../util/files");
var resource_types_1 = require("../types/resource-types");
var print_1 = require("../fql/print");
var transform_1 = require("../fql/transform");
var writeMigrations = function (migrations) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        files_1.writeNewMigration(migrations);
        return [2 /*return*/];
    });
}); };
exports.writeMigrations = writeMigrations;
var generateMigrations = function (planned) { return __awaiter(void 0, void 0, void 0, function () {
    var migrExprs, migrExprsFlat;
    return __generator(this, function (_a) {
        migrExprs = [];
        // First add all the ones we can generate generically.
        migrExprs.push(transformStatements(planned[resource_types_1.ResourceTypes.Role]));
        migrExprs.push(transformStatements(planned[resource_types_1.ResourceTypes.Function]));
        migrExprs.push(transformStatements(planned[resource_types_1.ResourceTypes.Collection]));
        migrExprs.push(transformStatements(planned[resource_types_1.ResourceTypes.Index]));
        migrExprs.push(transformStatements(planned[resource_types_1.ResourceTypes.AccessProvider]));
        migrExprsFlat = migrExprs.flat();
        migrExprsFlat.forEach(function (mig) {
            mig.fqlFormatted = print_1.prettyPrintExpr(mig.fqlExpr);
        });
        return [2 /*return*/, migrExprsFlat];
    });
}); };
exports.generateMigrations = generateMigrations;
var transformStatements = function (resources) {
    var migrExprs = [];
    resources.added.forEach(function (res) {
        var _a;
        migrExprs.push(transform_1.toTaggedExpr(res.target, (_a = res.target) === null || _a === void 0 ? void 0 : _a.fqlExpr, expressions_1.StatementType.Create));
    });
    resources.changed.forEach(function (res) {
        var _a;
        // indexes can't be updated.
        if (((_a = res.target) === null || _a === void 0 ? void 0 : _a.type) !== resource_types_1.ResourceTypes.Index && res.target) {
            migrExprs.push(transform_1.transformCreateToUpdate(res.target));
        }
    });
    resources.deleted.forEach(function (res) {
        if (res.previous) {
            migrExprs.push(transform_1.transformCreateToDelete(res.previous));
        }
    });
    return migrExprs;
};
