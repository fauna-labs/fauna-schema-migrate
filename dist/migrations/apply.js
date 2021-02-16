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
var CircularMigrationError_1 = require("../errors/CircularMigrationError");
var json_1 = require("../fql/json");
var expressions_1 = require("../types/expressions");
var resource_types_1 = require("../types/resource-types");
var unique_naming_1 = require("../util/unique-naming");
var eval_1 = require("../fql/eval");
var generateMigrationQuery = function (migrations) { return __awaiter(void 0, void 0, void 0, function () {
    var indexedMigrations, dependencyIndex, dependenciesArray, orderedExpressions, letBindingObject;
    return __generator(this, function (_a) {
        indexedMigrations = indexMigrations(migrations);
        dependencyIndex = findDependencies(migrations);
        dependenciesArray = indexToDependenciesArray(dependencyIndex);
        orderedExpressions = orderAccordingToDependencies(dependenciesArray, indexedMigrations);
        letBindingObject = generateLetBindingObject(orderedExpressions, indexedMigrations, dependencyIndex);
        return [2 /*return*/, letBindingObject];
    });
}); };
exports.generateMigrationQuery = generateMigrationQuery;
var orderAccordingToDependencies = function (dependenciesArray, indexedMigrations) {
    var namesPresent = {};
    var orderedExpressions = [];
    var popLength = 0;
    while (dependenciesArray.length > 0) {
        // if popLength becomes to big we have been around the complete array which means 
        // that we are running in circles (there are circular dependencies that can't)
        // be resolved
        if (popLength >= dependenciesArray.length) {
            throw new CircularMigrationError_1.CircularMigrationError(dependenciesArray.map(function (e) { return indexedMigrations[e.indexedName]; }));
        }
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
    return orderedExpressions;
};
var generateLetBindingObject = function (orderedExpressions, indexedMigrations, dependencyIndex) {
    var nameToVar = {};
    try {
        // obj is the object with variable bindings that will be fet to the Let.
        var obj_1 = {};
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
                    e.fql = replaceAll(e.fql, depExpr.type + "(\"" + depExpr.name + "\")", "Select(['ref'],Var(\"" + nameToVar[depIndexableName] + "\"))");
                }
            });
            nameToVar[indexableName] = "var" + varIndex;
            // Bind the variable to the code.
            obj_1["var" + varIndex] = eval_1.evalFQLCode(e.fql);
        });
        return obj_1;
    }
    catch (err) {
        console.error(err);
    }
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
        var found = json_1.findPatterns(expr.jsonData, jsonPatterns);
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
            return { pattern: { function: mig.name }, indexName: unique_naming_1.toIndexableName(mig) };
        case resource_types_1.ResourceTypes.Role:
            return { pattern: { role: mig.name }, indexName: unique_naming_1.toIndexableName(mig) };
        case resource_types_1.ResourceTypes.Collection:
            return { pattern: { collection: mig.name }, indexName: unique_naming_1.toIndexableName(mig) };
        case resource_types_1.ResourceTypes.Index:
            return { pattern: { index: mig.name }, indexName: unique_naming_1.toIndexableName(mig) };
        case resource_types_1.ResourceTypes.AccessProvider:
            return { pattern: { access_provider: mig.name }, indexName: unique_naming_1.toIndexableName(mig) };
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
