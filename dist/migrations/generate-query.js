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
exports.generateMigrationQuery = void 0;
var json_1 = require("../fql/json");
var expressions_1 = require("../types/expressions");
var resource_types_1 = require("../types/resource-types");
var unique_naming_1 = require("../util/unique-naming");
var eval_1 = require("../fql/eval");
var transform_1 = require("../fql/transform");
var generateMigrationQuery = function (migrations) { return __awaiter(void 0, void 0, void 0, function () {
    var indexedMigrations, dependencyIndex, dependenciesArray, orderedExpressions, letBindingObject;
    return __generator(this, function (_a) {
        indexedMigrations = indexMigrations(migrations);
        dependencyIndex = findDependencies(migrations);
        dependenciesArray = indexToDependenciesArray(dependencyIndex);
        orderedExpressions = orderAccordingToDependencies(dependenciesArray, indexedMigrations);
        orderedExpressions = reOrderDeleted(orderedExpressions);
        letBindingObject = generateLetBindingObject(orderedExpressions, indexedMigrations, dependencyIndex);
        return [2 /*return*/, letBindingObject];
    });
}); };
exports.generateMigrationQuery = generateMigrationQuery;
var reOrderDeleted = function (orderedExpressions) {
    // Deleting an index after a colleciton doesn't work.
    // Since deleting the collection also triggers a delete of the index.
    var deleted = orderedExpressions.filter(function (e) {
        return e.statement === expressions_1.StatementType.Delete;
    });
    var rest = orderedExpressions.filter(function (e) {
        return e.statement !== expressions_1.StatementType.Delete;
    });
    var deletedIndexes = deleted.filter(function (e) {
        return e.type === resource_types_1.ResourceTypes.Index;
    });
    var deletedRest = deleted.filter(function (e) {
        return e.type !== resource_types_1.ResourceTypes.Index;
    });
    return deletedIndexes.concat(deletedRest).concat(rest);
};
var orderAccordingToDependencies = function (dependenciesArray, indexedMigrations) {
    var namesPresent = {};
    var orderedExpressions = [];
    var popLength = 0;
    while (dependenciesArray.length > 0 && popLength < dependenciesArray.length) {
        // if popLength becomes to big we have been around the complete array which means
        // that we are running in circles (there are circular dependencies that can't)
        // be resolved
        var dep = dependenciesArray.shift();
        popLength++;
        var allDepsPresent = dep === null || dep === void 0 ? void 0 : dep.dependencyIndexNames.every(function (el) {
            return namesPresent[el] || indexedMigrations[el].statement === expressions_1.StatementType.Update;
        });
        if (allDepsPresent) {
            namesPresent[dep.indexedName] = true;
            orderedExpressions.push(indexedMigrations[dep.indexedName]);
            popLength = 0;
        }
        // else, push to end, first handle others
        else {
            dependenciesArray.push(dep);
        }
    }
    // If there are still items in the dependency array it means we have circular dependencies.
    replaceWithStubs(dependenciesArray, indexedMigrations, orderedExpressions);
    return orderedExpressions;
};
var replaceWithStubs = function (dependenciesArray, indexedMigrations, orderedExpressions) {
    var stubbed = [];
    var others = [];
    while (dependenciesArray.length > 0) {
        var dep = dependenciesArray.shift();
        var expr = indexedMigrations[dep.indexedName];
        if (expr.statement === expressions_1.StatementType.Create) {
            orderedExpressions.push(transform_1.createStub(expr));
            stubbed.push(transform_1.transformCreateToUpdate(expr));
        }
        else {
            others.push(expr);
        }
    }
    // then handle the others
    others.forEach(function (expr) {
        orderedExpressions.push(expr);
    });
    stubbed.forEach(function (expr) {
        orderedExpressions.push(expr);
    });
};
var generateLetBindingObject = function (orderedExpressions, indexedMigrations, dependencyIndex) {
    var nameToVar = {};
    // obj is the object with variable bindings that will be fet to the Let.
    var obj = {};
    orderedExpressions.forEach(function (e, varIndex) {
        var indexableName = unique_naming_1.toIndexableName(e);
        var dependencies = dependencyIndex[indexableName];
        dependencies.forEach(function (dep) {
            var depExpr = indexedMigrations[dep];
            // If it's a create we need to reference it by the
            // variable since Fauna won't know it yet
            if (depExpr.statement === expressions_1.StatementType.Create) {
                var depIndexableName = unique_naming_1.toIndexableName(depExpr);
                // replace a refernece to another resource
                // with the variable that was bound to it.
                // Todo, currently done via the string which is probably
                // a silly inefficient way to do it (but easier).
                // Might want to change this and do an expression manipulation
                // instead directly.
                e.fql = replaceAll(e.fql, depExpr.type + "(\"" + depExpr.name + "\")", "Var(\"" + nameToVar[depIndexableName] + "\")");
            }
        });
        if (nameToVar[indexableName] && e.statement === expressions_1.StatementType.Update) {
            e.fql = replaceAll(e.fql, e.type + "(\"" + e.name + "\")", "Var(\"" + nameToVar[indexableName] + "\")");
        }
        // only the first occurance is a create.
        // due to circular dependency stubbing, there might be
        // both a create and an update.
        if (!nameToVar[indexableName]) {
            nameToVar[indexableName] = "var" + varIndex;
        }
        // Bind the variable to the code.
        obj["var" + varIndex] = eval_1.evalFQLCode("Select(['ref'], " + e.fql + ")");
    });
    return obj;
};
var replaceAll = function (str, old, newStr) {
    return str.split(old).join(newStr);
};
var findDependencies = function (migrations) {
    var jsonPatterns = [];
    migrations.forEach(function (mig) {
        jsonPatterns.push(toPattern(mig, mig.type));
    });
    var dependencyIndex = indexReferencedDependencies(migrations, jsonPatterns);
    return dependencyIndex;
};
var indexMigrations = function (flattened) {
    var indexedMigrations = {};
    flattened.forEach(function (expr) {
        var indexableName = unique_naming_1.toIndexableName(expr);
        indexedMigrations[indexableName] = expr;
    });
    return indexedMigrations;
};
var indexReferencedDependencies = function (flattened, jsonPatterns) {
    var index = {};
    flattened.forEach(function (expr) {
        var indexableName = unique_naming_1.toIndexableName(expr);
        var found = json_1.findPatterns(expr.fqlExpr, jsonPatterns);
        // exclude self in case that would happen (although it shouldn't)
        found = found.filter(function (e) { return e !== indexableName; });
        index[indexableName] = found;
    });
    return index;
};
var toPattern = function (mig, type) {
    // Seems to be always the same. We could simplify the code
    switch (type) {
        case resource_types_1.ResourceTypes.Function:
            return { pattern: { raw: { function: mig.name } }, indexName: unique_naming_1.toIndexableName(mig) };
        case resource_types_1.ResourceTypes.Role:
            return { pattern: { raw: { role: mig.name } }, indexName: unique_naming_1.toIndexableName(mig) };
        case resource_types_1.ResourceTypes.Collection:
            return { pattern: { raw: { collection: mig.name } }, indexName: unique_naming_1.toIndexableName(mig) };
        case resource_types_1.ResourceTypes.Index:
            return { pattern: { raw: { index: mig.name } }, indexName: unique_naming_1.toIndexableName(mig) };
        case resource_types_1.ResourceTypes.AccessProvider:
            return { pattern: { raw: { access_provider: mig.name } }, indexName: unique_naming_1.toIndexableName(mig) };
        case resource_types_1.ResourceTypes.Database:
            return { pattern: { raw: { database: mig.name } }, indexName: unique_naming_1.toIndexableName(mig) };
        default:
            throw new Error("unknown type in toPattern " + type);
    }
};
var indexToDependenciesArray = function (dependencyIndex) {
    return Object.keys(dependencyIndex).map(function (indexedName) {
        var dependencIndexNames = dependencyIndex[indexedName];
        return {
            indexedName: indexedName,
            dependencyIndexNames: dependencIndexNames
        };
    }).sort(function (a, b) {
        return a.dependencyIndexNames.length - b.dependencyIndexNames.length;
    });
};
