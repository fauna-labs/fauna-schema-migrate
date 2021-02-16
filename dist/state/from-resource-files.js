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
exports.getAllResourceSnippets = void 0;
var files_1 = require("../util/files");
var match_1 = require("../fql/match");
var expressions_1 = require("../types/expressions");
var resource_types_1 = require("../types/resource-types");
var unique_naming_1 = require("../util/unique-naming");
var DuplicateResourceError_1 = require("../errors/DuplicateResourceError");
var EmptyResourceFileError_1 = require("../errors/EmptyResourceFileError");
var getAllResourceSnippets = function (atChildDbPath) {
    if (atChildDbPath === void 0) { atChildDbPath = []; }
    return __awaiter(void 0, void 0, void 0, function () {
        var paths, snippets, i, p, snippet, byNameAndType, categories, item;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, files_1.retrieveAllResourcePaths(atChildDbPath)];
                case 1:
                    paths = _a.sent();
                    snippets = [];
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < paths.length)) return [3 /*break*/, 5];
                    p = paths[i];
                    return [4 /*yield*/, files_1.loadFqlSnippet(p)];
                case 3:
                    snippet = _a.sent();
                    if (!snippet) {
                        throw new EmptyResourceFileError_1.EmptyResourceFileError(p);
                    }
                    snippets.push({
                        fqlExpr: snippet,
                        fql: snippet.toFQL(),
                        name: '',
                        jsonData: {},
                        // a resource file should always be a create!
                        statement: expressions_1.StatementType.Create,
                        db: atChildDbPath
                    });
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5:
                    match_1.verifyCreateStatementsOnly(snippets);
                    match_1.addNamesAndTypes(snippets);
                    byNameAndType = {};
                    snippets.forEach(function (snippet) {
                        var key = unique_naming_1.toIndexableName(snippet);
                        // If there is already an expression for this name and
                        // it was present in the same migration, error, that shouldn't happen.
                        if (byNameAndType[key]) {
                            throw new DuplicateResourceError_1.DuplicateResourceError(snippet);
                        }
                        // Else, just override, pathsAndExpressions are ordered.
                        // That way we get the latest migrations.
                        byNameAndType[key] = snippet;
                    });
                    categories = {};
                    for (item in resource_types_1.ResourceTypes) {
                        categories[item] = [];
                    }
                    snippets.forEach(function (s) {
                        categories[s.type].push(s);
                    });
                    return [2 /*return*/, categories];
            }
        });
    });
};
exports.getAllResourceSnippets = getAllResourceSnippets;
