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
exports.planMigrations = void 0;
var equalDeep = require('deep-equal');
var cloneDeep = require('lodash.clonedeep');
var expressions_1 = require("../types/expressions");
var from_resource_files_1 = require("../state/from-resource-files");
var from_migration_files_1 = require("../state/from-migration-files");
var planMigrations = function () { return __awaiter(void 0, void 0, void 0, function () {
    var resourcesFQL, migrationsFQL, migrationDiff;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, from_resource_files_1.getAllResourceSnippets()];
            case 1:
                resourcesFQL = _a.sent();
                return [4 /*yield*/, from_migration_files_1.getAllLastMigrationSnippets()
                    // const cloudResources = await getAllCloudResources()
                ];
            case 2:
                migrationsFQL = _a.sent();
                migrationDiff = {};
                // resources determine how your migrations look.
                // migrations are the source of truth of how your cloud
                // should look. The latest migration of a certain migration
                // contains the full state, it's either created from scratch,
                // updated (with the full new parameters) or deleted.
                // Cloud resources are retrieved in order to know references of the resources to update.
                // This means that if you do manual changes in cloud, those will be overwritten!
                Object.keys(migrationsFQL).forEach(function (type) {
                    var migration = cloneDeep(migrationsFQL[type]);
                    var resource = cloneDeep(resourcesFQL[type]);
                    migrationDiff[type] = createPairsForType(migration, resource);
                });
                // We don't need the reference on second thought, currently not used.
                // addReferences(migrationDiff, cloudResources)
                return [2 /*return*/, migrationDiff];
        }
    });
}); };
exports.planMigrations = planMigrations;
/* We'll match them by name */
var createPairsForType = function (previouss, currents) {
    var pairs = {
        added: [],
        changed: [],
        unchanged: [],
        deleted: []
    };
    while (currents.length > 0) {
        var current = currents.pop();
        var previousIndex = findIndex(current, previouss);
        if (previousIndex !== -1) {
            var res = previouss.splice(previousIndex, 1);
            var previous = res[0];
            console.log('equalDeep?', previous.jsonData, current.jsonData);
            if (equalDeep(previous.jsonData, current.jsonData)) {
                console.log('TRUE!');
                pairs.unchanged.push({ current: current, previous: previous });
            }
            else {
                pairs.changed.push({ current: current, previous: previous });
            }
        }
        else {
            pairs.added.push({ current: current });
        }
    }
    while (previouss.length > 0) {
        var previous = previouss.pop();
        if ((previous === null || previous === void 0 ? void 0 : previous.statement) !== expressions_1.StatementType.Delete) {
            pairs.deleted.push({ previous: previous });
        }
    }
    return pairs;
};
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
// const addReferences = (migrationDiff: PlannedMigrations, cloudResources: LoadedResources) => {
//     Object.keys(migrationDiff).forEach((type) => {
//         const diffForType = migrationDiff[type]
//         diffForType.changed.forEach((v: PreviousAndCurrent) => {
//             const index = findIndex(<NamedValue>v.current, cloudResources[type])
//             if (index === -1) {
//                 const res = <TaggedExpression>v.current
//                 throw new TriedChangingMissingCloudResourceError(res)
//             }
//             else {
//                 v.ref = retrieveCloudReference(cloudResources[type][index])
//             }
//         })
//         diffForType.deleted.forEach((v: PreviousAndCurrent) => {
//             const index = findIndex(<NamedValue>v.previous, cloudResources[type])
//             if (index === -1) {
//                 const res = <TaggedExpression>v.previous
//                 throw new TriedDeletingMissingCloudResourceError(res)
//             }
//             else {
//                 v.ref = retrieveCloudReference(cloudResources[type][index])
//             }
//         })
//     })
// }
