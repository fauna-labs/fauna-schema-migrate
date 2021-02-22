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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformDiffToExpressions = exports.retrieveDiff = exports.retrieveDatabasesDiff = void 0;
var equalDeep = require('deep-equal');
var cloneDeep = require('lodash.clonedeep');
var expressions_1 = require("../types/expressions");
var UpdateIndexError_1 = require("../errors/UpdateIndexError");
var resource_types_1 = require("../types/resource-types");
var transform_1 = require("../fql/transform");
var deep_equal_1 = __importDefault(require("deep-equal"));
var retrieveDatabasesDiff = function (currentDbs, targetDbs) { return __awaiter(void 0, void 0, void 0, function () {
    var dbDiff;
    return __generator(this, function (_a) {
        dbDiff = [];
        currentDbs.forEach(function (c) {
            var stillExists = targetDbs.some(function (t) { return equalDeep(c, t); });
            if (stillExists) {
                // don't support metadata for dbs atm.
                dbDiff.push(transform_1.transformDbPathToUpdate(c));
            }
            else {
                dbDiff.push(transform_1.transformDbPathToDelete(c));
            }
        });
        targetDbs.forEach(function (t) {
            var didExistBefore = currentDbs.some(function (c) { return equalDeep(c, t); });
            if (!didExistBefore) {
                dbDiff.push(transform_1.transformDbPathToCreate(t));
            }
        });
        return [2 /*return*/, dbDiff];
    });
}); };
exports.retrieveDatabasesDiff = retrieveDatabasesDiff;
var retrieveDiff = function (currentExpressions, targetExpressions) {
    // the migrationsFQL param contains the last state of each resource.
    // the resourcesFQL param contains the state of the resources folder for each resource.
    // calculating what has changed is therefore easy.
    var migrationDiff = {};
    Object.keys(currentExpressions).forEach(function (type) {
        var fromPerType = cloneDeep(currentExpressions[type]);
        var targetPerType = cloneDeep(targetExpressions[type]);
        migrationDiff[type] = createPairsForType(fromPerType, targetPerType);
    });
    // Index updates are not supported (and can't be), throw error.
    throwErrorOnIndexUpdates(migrationDiff[resource_types_1.ResourceTypes.Index]);
    return migrationDiff;
};
exports.retrieveDiff = retrieveDiff;
/* We'll match them by name */
var createPairsForType = function (currentExpressions, targetExpressions) {
    var pairs = {
        added: [],
        changed: [],
        unchanged: [],
        deleted: []
    };
    while (targetExpressions.length > 0) {
        // Careful, this logic is used both for comparing pure Create statements (resources)
        // where two consecutive Create statements result in a change.
        // as well as comparing migrations (which contain Create/Update/Delete)
        var target = targetExpressions.pop();
        var previousIndex = findIndex(target, currentExpressions);
        if ((target === null || target === void 0 ? void 0 : target.statement) === expressions_1.StatementType.Delete) {
            // ignore deletes
        }
        else if (previousIndex !== -1) {
            var res = currentExpressions.splice(previousIndex, 1);
            var previous = res[0];
            if (equalDeepWithExplicitParameters(previous, target)) {
                pairs.unchanged.push({ target: target, previous: previous });
            }
            else {
                pairs.changed.push({ target: target, previous: previous });
            }
        }
        else {
            pairs.added.push({ target: target });
        }
    }
    while (currentExpressions.length > 0) {
        var previous = currentExpressions.pop();
        pairs.deleted.push({ previous: previous });
    }
    return pairs;
};
// Since we've set explicit paramaters, the diff might be off.
// if explicit parameters are set, those are set upon an Update.
// Therefore, if comparing to a Create, remove the explicit paramaters.
var equalDeepWithExplicitParameters = function (e1, e2) {
    var j1 = e1.jsonData;
    var j2 = e2.jsonData;
    if (e1.statement === expressions_1.StatementType.Create) {
        j2 = cloneDeep(j2);
        Object.keys(j2).forEach(function (k) {
            if (j2[k] === null) {
                delete j2[k];
            }
        });
    }
    if (e2.statement === expressions_1.StatementType.Create) {
        j1 = cloneDeep(j1);
        Object.keys(j1).forEach(function (k) {
            if (j1[k] === null) {
                delete j1[k];
            }
        });
    }
    return deep_equal_1.default(j1, j2);
};
var transformDiffToExpressions = function (diff) {
    var expressions = [];
    for (var resourceType in resource_types_1.ResourceTypes) {
        var diffForType = diff[resourceType];
        diffForType.added.map(function (prevCurr) {
            var _a, _b, _c;
            if (((_a = prevCurr.target) === null || _a === void 0 ? void 0 : _a.statement) === expressions_1.StatementType.Update) {
                expressions.push(transform_1.transformUpdateToCreate(prevCurr.target));
            }
            else if (((_b = prevCurr.target) === null || _b === void 0 ? void 0 : _b.statement) === expressions_1.StatementType.Create) {
                expressions.push(prevCurr.target);
            }
            else {
                throw Error("Unexpected type in rollback " + ((_c = prevCurr.target) === null || _c === void 0 ? void 0 : _c.statement));
            }
        });
        diffForType.changed.map(function (prevCurr) {
            var _a, _b, _c;
            // CHANGED
            // changed in rollback means that the migrations we are rolling back did an update.
            // The previous statement can be both a Create as an Update and since the resource
            // already exists it needs to be trasnformed to an Update.
            if (((_a = prevCurr.target) === null || _a === void 0 ? void 0 : _a.statement) === expressions_1.StatementType.Update) {
                // if it's an update, keep it
                expressions.push(transform_1.transformUpdateToUpdate(prevCurr.target));
            }
            else if (((_b = prevCurr.target) === null || _b === void 0 ? void 0 : _b.statement) === expressions_1.StatementType.Create) {
                // if it's a create. trasnform to an update.
                expressions.push(transform_1.transformCreateToUpdate(prevCurr.target));
            }
            else {
                throw Error("Unexpected type in rollback " + ((_c = prevCurr.target) === null || _c === void 0 ? void 0 : _c.statement));
            }
        });
        diffForType.deleted.map(function (prevCurr) {
            var _a, _b, _c;
            // ADDED
            // deleted in rollback means that the migrations we are rolling back added a resource.
            // The previous statement should therefore be a CREATE or UDPATE statement and
            // the current will not exist. We need to replace it with a DELETE
            if (((_a = prevCurr.previous) === null || _a === void 0 ? void 0 : _a.statement) === expressions_1.StatementType.Update) {
                // if it's an update, keep it
                expressions.push(transform_1.transformCreateToDelete(prevCurr.previous));
            }
            else if (((_b = prevCurr.previous) === null || _b === void 0 ? void 0 : _b.statement) === expressions_1.StatementType.Create) {
                // if it's a create. trasnform to an update.
                expressions.push(transform_1.transformUpdateToDelete(prevCurr.previous));
            }
            else {
                throw Error("Unexpected type in rollback " + ((_c = prevCurr.target) === null || _c === void 0 ? void 0 : _c.statement));
            }
        });
    }
    return expressions;
};
exports.transformDiffToExpressions = transformDiffToExpressions;
var findIndex = function (resource1, resources) {
    var index = 0;
    for (var _i = 0, resources_1 = resources; _i < resources_1.length; _i++) {
        var resource2 = resources_1[_i];
        if (resource2.name === resource1.name) {
            return index;
        }
        index++;
    }
    return -1;
};
var throwErrorOnIndexUpdates = function (indices) {
    if (indices.changed.length > 0) {
        throw new UpdateIndexError_1.UpdateIndexError(indices.changed);
    }
};
