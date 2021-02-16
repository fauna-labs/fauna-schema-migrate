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
exports.writeMigrations = void 0;
var fauna = __importStar(require("faunadb"));
var _a = fauna.query, Update = _a.Update, Delete = _a.Delete, Role = _a.Role, Function = _a.Function, Collection = _a.Collection, Index = _a.Index;
var files_1 = require("../util/files");
var resource_types_1 = require("../types/resource-types");
var print_1 = require("../fql/print");
var writeMigrations = function (planned) { return __awaiter(void 0, void 0, void 0, function () {
    var migrExprs, t, migrExprsFlat;
    return __generator(this, function (_a) {
        migrExprs = [];
        // First add all the ones we can generate generically.
        for (t in resource_types_1.ResourceTypes) {
            migrExprs.push(getCreateAndDeleteGeneric(planned[t]));
        }
        // Then add the special cases.
        migrExprs.push(getUpdateRoleExpressions(planned[resource_types_1.ResourceTypes.Role]));
        migrExprs.push(getUpdateFuncExpressions(planned[resource_types_1.ResourceTypes.Function]));
        migrExprs.push(getUpdateCollectionExpressions(planned[resource_types_1.ResourceTypes.Collection]));
        migrExprs.push(getUpdateIndexExpressions(planned[resource_types_1.ResourceTypes.Index]));
        migrExprsFlat = migrExprs.flat();
        migrExprsFlat.forEach(function (mig) {
            mig.fqlFormatted = print_1.prettyPrintExpr(mig.fqlExpr);
        });
        files_1.writeNewMigration(migrExprsFlat);
        return [2 /*return*/];
    });
}); };
exports.writeMigrations = writeMigrations;
var getCreateAndDeleteGeneric = function (resources) {
    var migrExprs = [];
    resources.added.forEach(function (res) {
        var _a;
        migrExprs.push(toTaggedExpr(res.current, (_a = res.current) === null || _a === void 0 ? void 0 : _a.fqlExpr));
    });
    resources.deleted.forEach(function (res) {
        migrExprs.push(toTaggedExpr(res.previous, Delete(getReference(res.previous, Role))));
    });
    return migrExprs;
};
var getUpdateCollectionExpressions = function (collections) {
    var migrExprs = [];
    collections.changed.forEach(function (col) {
        console.log("TODO DETERMINE STRUCTURE COLLECTIONS", col);
        // migrExprs.push(toTaggedExpr(col.current, Update(
        //     getReference(<TaggedExpression>col.current, Collection),
        // TODO
        // )))
    });
    return migrExprs;
};
var getUpdateIndexExpressions = function (indices) {
    var migrExprs = [];
    indices.changed.forEach(function (ind) {
        console.log("TODO DETERMINE STRUCTURE INDICES", ind);
        // migrExprs.push(toTaggedExpr(col.current, Update(
        //     getReference(<TaggedExpression>col.current, Index),
        // TODO
        // )))
    });
    return migrExprs;
};
var getUpdateRoleExpressions = function (roles) {
    var migrExprs = [];
    roles.changed.forEach(function (role) {
        var _a;
        migrExprs.push(toTaggedExpr(role.current, Update(getReference(role.current, Role), { privileges: (_a = role.current) === null || _a === void 0 ? void 0 : _a.fqlExpr.raw.create_role.raw.object.privileges })));
    });
    return migrExprs;
};
var getUpdateFuncExpressions = function (functions) {
    var migrExprs = [];
    functions.changed.forEach(function (func) {
        var _a, _b;
        migrExprs.push(toTaggedExpr(func.current, Update(getReference(func.current, Function), {
            body: (_a = func.current) === null || _a === void 0 ? void 0 : _a.fqlExpr.raw.create_function.raw.object.body,
            role: (_b = func.current) === null || _b === void 0 ? void 0 : _b.fqlExpr.raw.create_function.raw.object.role
        })));
    });
    return migrExprs;
};
var getReference = function (taggedExpr, fqlFunc) {
    return fqlFunc(taggedExpr.name);
};
var toTaggedExpr = function (taggedExpr, expr) {
    if (taggedExpr === undefined) {
        throw new Error('toTaggedExpr: received undefined expr');
    }
    else {
        return {
            name: taggedExpr.name,
            type: taggedExpr.type,
            fqlExpr: expr
        };
    }
};
