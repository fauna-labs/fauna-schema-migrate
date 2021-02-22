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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filePathToDatabase = exports.writeNewMigrationDir = exports.writeNewMigration = exports.arrayToApplicationPath = exports.deleteTempDir = exports.deleteMigrationDir = exports.generateMigrationDir = exports.generateDefaultDirs = exports.retrieveLastMigrationVersionAndPathsForMigrationBefore = exports.retrieveAllMigrations = exports.retrieveAllResourceChildDbPaths = exports.retrieveAllResourceChildDb = exports.retrieveAllResourcePaths = exports.writeApplicationFile = exports.loadApplicationFile = exports.loadFqlResource = exports.loadJsResource = exports.loadFqlSnippet = void 0;
var fs_1 = __importStar(require("fs"));
var path_1 = __importDefault(require("path"));
var esbuild = __importStar(require("esbuild"));
var shelljs_1 = __importDefault(require("shelljs"));
var glob_1 = __importDefault(require("glob"));
var util_1 = __importDefault(require("util"));
var config_1 = require("./config");
var expressions_1 = require("../types/expressions");
var eval_1 = require("../fql/eval");
var print_1 = require("../fql/print");
var globPromise = util_1.default.promisify(glob_1.default);
var loadFqlSnippet = function (p) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!p.endsWith('.js')) return [3 /*break*/, 2];
                return [4 /*yield*/, exports.loadJsResource(p)];
            case 1: return [2 /*return*/, _a.sent()];
            case 2:
                if (!p.endsWith('.fql')) return [3 /*break*/, 4];
                return [4 /*yield*/, exports.loadFqlResource(p)];
            case 3: return [2 /*return*/, _a.sent()];
            case 4:
                console.error("unexpected extension " + p);
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.loadFqlSnippet = loadFqlSnippet;
var loadJsResource = function (p) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, filename, _c, _d, _e, fql;
    var _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _b = (_a = esbuild).build;
                _f = {
                    entryPoints: [p]
                };
                return [4 /*yield*/, config_1.config.getTempDir()];
            case 1: 
            // a JS resource will be compiled to the temporary
            // folder first since it might import other
            // pieces of code, a regular dynamic import() would not work.
            return [4 /*yield*/, _b.apply(_a, [(_f.outdir = _g.sent(),
                        _f.bundle = true,
                        _f.platform = "node",
                        _f.format = "cjs",
                        _f.target = ["node10.4"],
                        _f)])];
            case 2:
                // a JS resource will be compiled to the temporary
                // folder first since it might import other
                // pieces of code, a regular dynamic import() would not work.
                _g.sent();
                _d = (_c = path_1.default).join;
                _e = [process.cwd()];
                return [4 /*yield*/, config_1.config.getTempDir()];
            case 3:
                filename = _d.apply(_c, _e.concat([_g.sent(), path_1.default.parse(p).base]));
                delete require.cache[filename];
                return [4 /*yield*/, require(filename)];
            case 4:
                fql = _g.sent();
                return [2 /*return*/, fql.default];
        }
    });
}); };
exports.loadJsResource = loadJsResource;
var loadFqlResource = function (p) { return __awaiter(void 0, void 0, void 0, function () {
    var data, fql;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.loadApplicationFile(p)];
            case 1:
                data = _a.sent();
                fql = eval_1.evalFQLCode(data);
                return [2 /*return*/, fql];
        }
    });
}); };
exports.loadFqlResource = loadFqlResource;
var loadApplicationFile = function (file) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, fs_1.default.readFileSync(path_1.default.join(process.cwd(), file), "utf8")];
    });
}); };
exports.loadApplicationFile = loadApplicationFile;
var writeApplicationFile = function (file, content) { return __awaiter(void 0, void 0, void 0, function () {
    var fileFullPath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fileFullPath = path_1.default.join(process.cwd(), file);
                return [4 /*yield*/, fs_1.default.writeFileSync(fileFullPath, content)];
            case 1:
                _a.sent();
                return [2 /*return*/, fileFullPath];
        }
    });
}); };
exports.writeApplicationFile = writeApplicationFile;
var retrieveAllResourcePaths = function (atChildDbPath, ignoreChildDbs) {
    if (atChildDbPath === void 0) { atChildDbPath = []; }
    if (ignoreChildDbs === void 0) { ignoreChildDbs = true; }
    return __awaiter(void 0, void 0, void 0, function () {
        var resourcesDir, childDbsDir, fullPath, jsResults, fqlResults;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, config_1.config.getResourcesDir()];
                case 1:
                    resourcesDir = _a.sent();
                    return [4 /*yield*/, config_1.config.getChildDbsDirName()];
                case 2:
                    childDbsDir = _a.sent();
                    fullPath = childDbPathToFullPath(resourcesDir, atChildDbPath, childDbsDir);
                    return [4 /*yield*/, retrieveAllPathsInPattern(fullPath, "**/*.js", ignoreChildDbs)];
                case 3:
                    jsResults = _a.sent();
                    return [4 /*yield*/, retrieveAllPathsInPattern(fullPath, "**/*.fql", ignoreChildDbs)];
                case 4:
                    fqlResults = _a.sent();
                    return [2 /*return*/, jsResults.concat(fqlResults)];
            }
        });
    });
};
exports.retrieveAllResourcePaths = retrieveAllResourcePaths;
var retrieveAllResourceChildDb = function (atChildDbPath) {
    if (atChildDbPath === void 0) { atChildDbPath = []; }
    return __awaiter(void 0, void 0, void 0, function () {
        var childDbsDir, resourcesDir, fullPath, paths;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, config_1.config.getChildDbsDirName()];
                case 1:
                    childDbsDir = _a.sent();
                    return [4 /*yield*/, config_1.config.getResourcesDir()];
                case 2:
                    resourcesDir = _a.sent();
                    fullPath = childDbPathToFullPath(resourcesDir, atChildDbPath, childDbsDir);
                    return [4 /*yield*/, exports.retrieveAllResourceChildDbPaths(fullPath, childDbsDir)];
                case 3:
                    paths = _a.sent();
                    return [2 /*return*/, paths
                            .map(function (p) {
                            var splpath = p.split(path_1.default.sep);
                            var previous = false;
                            var acc = [];
                            splpath.forEach(function (e, index) {
                                if (e === childDbsDir) {
                                    previous = true;
                                }
                                else if (previous) {
                                    acc.push(e);
                                    previous = false;
                                }
                            });
                            return acc;
                        })];
            }
        });
    });
};
exports.retrieveAllResourceChildDb = retrieveAllResourceChildDb;
var retrieveAllResourceChildDbPaths = function (fullPath, childDbsDirNAme) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, retrieveAllResourceChildDbsIter(fullPath, childDbsDirNAme)];
    });
}); };
exports.retrieveAllResourceChildDbPaths = retrieveAllResourceChildDbPaths;
var retrieveAllResourceChildDbsIter = function (resourcesDir, childDbsDirName) {
    if (fs_1.existsSync(resourcesDir)) {
        var dirs = getDirectories(resourcesDir, false, "").filter(function (d) {
            return d === childDbsDirName;
        });
        var childrenDir_1 = dirs && dirs.length > 0 ? dirs[0] : null;
        if (!childrenDir_1) {
            return [];
        }
        else {
            var childDirs = getDirectories(path_1.default.join(resourcesDir, childrenDir_1), false, "");
            var newResources = childDirs.map(function (d) { return path_1.default.join(resourcesDir, childrenDir_1, d); });
            return newResources.concat(newResources
                .flatMap(function (r) { return retrieveAllResourceChildDbsIter(r, childDbsDirName); }));
        }
    }
    else {
        return [];
    }
};
var retrieveAllMigrations = function (atChildDbPath) {
    if (atChildDbPath === void 0) { atChildDbPath = []; }
    return __awaiter(void 0, void 0, void 0, function () {
        var childDbsDir, migrationsDir, fullPath, migrationSubdirs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, config_1.config.getChildDbsDirName()];
                case 1:
                    childDbsDir = _a.sent();
                    return [4 /*yield*/, config_1.config.getMigrationsDir()];
                case 2:
                    migrationsDir = _a.sent();
                    fullPath = childDbPathToFullPath(path_1.default.join(migrationsDir), atChildDbPath, childDbsDir);
                    migrationSubdirs = getDirectories(fullPath, true, childDbsDir);
                    return [2 /*return*/, migrationSubdirs];
            }
        });
    });
};
exports.retrieveAllMigrations = retrieveAllMigrations;
// retrieves the last version of each migration resource before a given timestamp
// since we are rolling back that migration we need to know what the original state was
// of that resource.
var retrieveLastMigrationVersionAndPathsForMigrationBefore = function (atChildDbPath, before, ignoreChildDbs) {
    if (ignoreChildDbs === void 0) { ignoreChildDbs = true; }
    return __awaiter(void 0, void 0, void 0, function () {
        var childDbsDir, migrationsDir, fullPath, migrationSubdirs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, config_1.config.getChildDbsDirName()];
                case 1:
                    childDbsDir = _a.sent();
                    return [4 /*yield*/, config_1.config.getMigrationsDir()];
                case 2:
                    migrationsDir = _a.sent();
                    fullPath = childDbPathToFullPath(path_1.default.join(migrationsDir), atChildDbPath, childDbsDir);
                    migrationSubdirs = getDirectories(fullPath, true, childDbsDir);
                    migrationSubdirs = getAllStrsBeforeEqual(migrationSubdirs, before);
                    return [4 /*yield*/, Promise.all(migrationSubdirs.map(function (migration) { return __awaiter(void 0, void 0, void 0, function () {
                            var jsResults, fqlResults;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, retrieveAllPathsInPattern(path_1.default.join(fullPath, migration), "**/*.js", ignoreChildDbs)];
                                    case 1:
                                        jsResults = _a.sent();
                                        return [4 /*yield*/, retrieveAllPathsInPattern(path_1.default.join(fullPath, migration), "**/*.fql", ignoreChildDbs)];
                                    case 2:
                                        fqlResults = _a.sent();
                                        return [2 /*return*/, {
                                                files: jsResults.concat(fqlResults),
                                                migration: migration
                                            }];
                                }
                            });
                        }); }))];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.retrieveLastMigrationVersionAndPathsForMigrationBefore = retrieveLastMigrationVersionAndPathsForMigrationBefore;
var getStrAfter = function (strs, after) {
    strs = strs.sort();
    for (var _i = 0, strs_1 = strs; _i < strs_1.length; _i++) {
        var str = strs_1[_i];
        if (str > after) {
            return str;
        }
    }
    return strs[strs.length - 1];
};
var getAllStrsBeforeEqual = function (strs, before) {
    strs = strs.sort();
    var res = [];
    for (var _i = 0, strs_2 = strs; _i < strs_2.length; _i++) {
        var str = strs_2[_i];
        if (before === null || str <= before) {
            res.push(str);
        }
        else {
            return res;
        }
    }
    return res;
};
var isDirectory = function (source) { return fs_1.lstatSync(source).isDirectory(); };
var getDirectories = function (source, ignoreChildDbs, childDbsDir) {
    if (fs_1.existsSync(source)) {
        return fs_1.readdirSync(source)
            .map(function (name) { return path_1.default.join(source, name); })
            .filter(isDirectory)
            .filter(function (dir) {
            if (!ignoreChildDbs) {
                return true;
            }
            else {
                var split = dir.split(path_1.default.sep);
                return split[split.length - 1] !== childDbsDir;
            }
        })
            .map(function (p) {
            var res = p.match(/([^\/]*)\/*$/);
            var folder = res[1];
            return folder;
        });
    }
    else {
        var folders = [];
        return folders;
    }
};
var retrieveAllPathsInPattern = function (basedir, pattern, ignoreChildDbs) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var _q;
    return __generator(this, function (_r) {
        switch (_r.label) {
            case 0:
                if (!ignoreChildDbs) return [3 /*break*/, 5];
                _a = globPromise;
                _c = (_b = path_1.default).join;
                return [4 /*yield*/, basedir];
            case 1:
                _d = [_c.apply(_b, [_r.sent(), pattern])];
                _q = {};
                _f = (_e = path_1.default).join;
                _g = [basedir, "**"];
                return [4 /*yield*/, config_1.config.getChildDbsDirName()];
            case 2:
                _h = [
                    _f.apply(_e, _g.concat([_r.sent(), "**/*"]))
                ];
                _k = (_j = path_1.default).join;
                _l = [basedir, "**"];
                return [4 /*yield*/, config_1.config.getChildDbsDirName()];
            case 3: return [4 /*yield*/, _a.apply(void 0, _d.concat([(_q.ignore = _h.concat([
                        _k.apply(_j, _l.concat([_r.sent()]))
                    ]),
                        _q)]))];
            case 4: return [2 /*return*/, _r.sent()];
            case 5:
                _m = globPromise;
                _p = (_o = path_1.default).join;
                return [4 /*yield*/, basedir];
            case 6: return [4 /*yield*/, _m.apply(void 0, [_p.apply(_o, [_r.sent(), pattern])])];
            case 7: return [2 /*return*/, _r.sent()];
        }
    });
}); };
var generateDefaultDirs = function () { return __awaiter(void 0, void 0, void 0, function () {
    var folders;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    config_1.config.getResourcesDir(),
                    config_1.config.getMigrationsDir(),
                ])
                // Todo, provide option to have nested generation!
                // maybe --childdbs=local, local.service1,local.service2, etc..
            ];
            case 1:
                folders = _a.sent();
                // Todo, provide option to have nested generation!
                // maybe --childdbs=local, local.service1,local.service2, etc..
                folders.forEach(function (folder) {
                    var fullPath = path_1.default.join(process.cwd(), folder);
                    shelljs_1.default.mkdir('-p', fullPath);
                });
                return [2 /*return*/];
        }
    });
}); };
exports.generateDefaultDirs = generateDefaultDirs;
var generateMigrationDir = function () { return __awaiter(void 0, void 0, void 0, function () {
    var fullPath, _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _b = (_a = path_1.default).join;
                _c = [process.cwd()];
                return [4 /*yield*/, config_1.config.getMigrationsDir()];
            case 1:
                fullPath = _b.apply(_a, _c.concat([_d.sent()]));
                shelljs_1.default.mkdir('-p', fullPath);
                return [2 /*return*/];
        }
    });
}); };
exports.generateMigrationDir = generateMigrationDir;
var deleteMigrationDir = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _b = (_a = shelljs_1.default).rm;
                _c = ['-rf'];
                return [4 /*yield*/, config_1.config.getMigrationsDir()];
            case 1:
                _b.apply(_a, _c.concat([_d.sent()]));
                return [2 /*return*/];
        }
    });
}); };
exports.deleteMigrationDir = deleteMigrationDir;
var deleteTempDir = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _b = (_a = shelljs_1.default).rm;
                _c = ['-rf'];
                return [4 /*yield*/, config_1.config.getTempDir()];
            case 1:
                _b.apply(_a, _c.concat([_d.sent()]));
                return [2 /*return*/];
        }
    });
}); };
exports.deleteTempDir = deleteTempDir;
var arrayToApplicationPath = function (filePath) {
    var fileFullPath = path_1.default.join.apply(path_1.default, __spreadArrays([process.cwd()], filePath));
    return fileFullPath;
};
exports.arrayToApplicationPath = arrayToApplicationPath;
var writeNewMigration = function (atChildDbPath, migrations, time) { return __awaiter(void 0, void 0, void 0, function () {
    var newMigrationDir_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!migrations.length) return [3 /*break*/, 2];
                return [4 /*yield*/, exports.writeNewMigrationDir(atChildDbPath, time)];
            case 1:
                newMigrationDir_1 = _a.sent();
                migrations.forEach(function (mig) {
                    var _a;
                    mig.fqlFormatted = print_1.prettyPrintExpr(mig.fqlExpr);
                    var statement = expressions_1.StatementType[mig.statement];
                    fs_1.default.writeFileSync(path_1.default.join(newMigrationDir_1, statement.toString().toLowerCase() + "-" + ((_a = mig.type) === null || _a === void 0 ? void 0 : _a.toString().toLowerCase()) + "-" + mig.name + ".fql"), mig.fqlFormatted);
                });
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); };
exports.writeNewMigration = writeNewMigration;
var writeNewMigrationDir = function (atChildDbPath, time) { return __awaiter(void 0, void 0, void 0, function () {
    var migrationsPath, _a, _b, _c, childDbsDir, fullPath;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _b = (_a = path_1.default).join;
                _c = [process.cwd()];
                return [4 /*yield*/, config_1.config.getMigrationsDir()];
            case 1:
                migrationsPath = _b.apply(_a, _c.concat([_d.sent()]));
                return [4 /*yield*/, config_1.config.getChildDbsDirName()];
            case 2:
                childDbsDir = _d.sent();
                fullPath = childDbPathToFullPath(migrationsPath, atChildDbPath, childDbsDir, time);
                shelljs_1.default.mkdir('-p', fullPath);
                return [2 /*return*/, fullPath];
        }
    });
}); };
exports.writeNewMigrationDir = writeNewMigrationDir;
var childDbPathToFullPath = function (rootDir, atChildDbPath, childDbName, time) {
    if (time === void 0) { time = ""; }
    if (atChildDbPath.length > 0) {
        var fullPaths = atChildDbPath.flatMap(function (name) {
            return [
                childDbName,
                name
            ];
        });
        return path_1.default.join.apply(path_1.default, __spreadArrays([rootDir], fullPaths, [time]));
    }
    else {
        return path_1.default.join(rootDir, time);
    }
};
var filePathToDatabase = function (childDbFolderName, filePath) {
    var childDb = [];
    var previousWasDbFolder = false;
    filePath.split(path_1.default.sep).forEach(function (p, index) {
        if (p === childDbFolderName) {
            previousWasDbFolder = true;
        }
        else if (previousWasDbFolder) {
            childDb.push(p);
            previousWasDbFolder = false;
        }
    });
    return childDb;
};
exports.filePathToDatabase = filePathToDatabase;
