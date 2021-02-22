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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.Config = void 0;
var path_1 = __importDefault(require("path"));
var files = __importStar(require("./files"));
var defaults_1 = __importDefault(require("./defaults"));
var fs_1 = require("fs");
var Config = /** @class */ (function () {
    function Config() {
        this.defaultConfigString = "";
        this.defaultConfigString = "{\n            \"directories\": {\n                \"root\": \"" + defaults_1.default.directories.root + "\",\n                \"resources\": \"" + defaults_1.default.directories.resources + "\",\n                \"migrations\": \"" + defaults_1.default.directories.migrations + "\",\n                \"children\": \"" + defaults_1.default.directories.children + "\",\n                \"temp\": \"" + defaults_1.default.directories.temp + "\"\n            },\n            \"collection\": \"" + defaults_1.default.collection + "\"\n    }";
    }
    Config.prototype.configDefault = function () {
        return "module.exports = " + this.defaultConfigString + " ";
    };
    Config.prototype.readConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.config) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.config];
                    case 1: return [2 /*return*/, (_b.sent()).default];
                    case 2:
                        if (!fs_1.existsSync(path_1.default.join(process.cwd(), defaults_1.default.configFile))) return [3 /*break*/, 5];
                        _a = this;
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require(path_1.default.join(process.cwd(), defaults_1.default.configFile))); })];
                    case 3:
                        _a.config = _b.sent();
                        return [4 /*yield*/, this.config];
                    case 4: return [2 /*return*/, (_b.sent()).default];
                    case 5: return [2 /*return*/, JSON.parse(this.defaultConfigString)];
                }
            });
        });
    };
    Config.prototype.writeConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var content, p, fullPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        content = this.configDefault();
                        p = path_1.default.join(defaults_1.default.configFile);
                        if (!fs_1.existsSync(p)) return [3 /*break*/, 1];
                        return [2 /*return*/, false];
                    case 1: return [4 /*yield*/, files.writeApplicationFile(p, content)];
                    case 2:
                        fullPath = _a.sent();
                        return [2 /*return*/, fullPath];
                }
            });
        });
    };
    Config.prototype.getMigrationsDir = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _b = (_a = path_1.default).join;
                        _c = this.getConfigVar;
                        return [4 /*yield*/, this.readConfig()];
                    case 1: return [4 /*yield*/, _c.apply(this, [(_f.sent()), ['directories', 'root']])];
                    case 2:
                        _d = [_f.sent()];
                        _e = this.getConfigVar;
                        return [4 /*yield*/, this.readConfig()];
                    case 3: return [4 /*yield*/, _e.apply(this, [(_f.sent()), ['directories', 'migrations']])];
                    case 4: return [2 /*return*/, _b.apply(_a, _d.concat([_f.sent()]))];
                }
            });
        });
    };
    Config.prototype.getResourcesDir = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _b = (_a = path_1.default).join;
                        _c = this.getConfigVar;
                        return [4 /*yield*/, this.readConfig()];
                    case 1: return [4 /*yield*/, _c.apply(this, [(_f.sent()), ['directories', 'root']])];
                    case 2:
                        _d = [_f.sent()];
                        _e = this.getConfigVar;
                        return [4 /*yield*/, this.readConfig()];
                    case 3: return [4 /*yield*/, _e.apply(this, [(_f.sent()), ['directories', 'resources']])];
                    case 4: return [2 /*return*/, _b.apply(_a, _d.concat([_f.sent()]))];
                }
            });
        });
    };
    Config.prototype.getMigrationCollection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.getConfigVar;
                        return [4 /*yield*/, this.readConfig()];
                    case 1: return [4 /*yield*/, _a.apply(this, [(_b.sent()), ['collection']])];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    Config.prototype.getTempDir = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _b = (_a = path_1.default).join;
                        _c = this.getConfigVar;
                        return [4 /*yield*/, this.readConfig()];
                    case 1: return [4 /*yield*/, _c.apply(this, [(_f.sent()), ['directories', 'root']])];
                    case 2:
                        _d = [_f.sent()];
                        _e = this.getConfigVar;
                        return [4 /*yield*/, this.readConfig()];
                    case 3: return [4 /*yield*/, _e.apply(this, [(_f.sent()), ['directories', 'temp']])];
                    case 4: return [2 /*return*/, _b.apply(_a, _d.concat([_f.sent()]))];
                }
            });
        });
    };
    Config.prototype.getChildDbsDir = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _b = (_a = path_1.default).join;
                        _c = this.getConfigVar;
                        return [4 /*yield*/, this.readConfig()];
                    case 1: return [4 /*yield*/, _c.apply(this, [(_g.sent()), ['directories', 'root']])];
                    case 2:
                        _d = [_g.sent()];
                        _e = this.getConfigVar;
                        return [4 /*yield*/, this.readConfig()];
                    case 3: return [4 /*yield*/, _e.apply(this, [(_g.sent()), ['directories', 'resources']])];
                    case 4:
                        _d = _d.concat([_g.sent()]);
                        _f = this.getConfigVar;
                        return [4 /*yield*/, this.readConfig()];
                    case 5: return [4 /*yield*/, _f.apply(this, [(_g.sent()), ['directories', 'children']])];
                    case 6: return [2 /*return*/, _b.apply(_a, _d.concat([_g.sent()]))];
                }
            });
        });
    };
    Config.prototype.getChildDbsDirName = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.getConfigVar;
                        return [4 /*yield*/, this.readConfig()];
                    case 1: return [4 /*yield*/, _a.apply(this, [(_b.sent()), ['directories', 'children']])];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    Config.prototype.getConfigVar = function (config, configPath) {
        return __awaiter(this, void 0, void 0, function () {
            var value_1;
            return __generator(this, function (_a) {
                try {
                    value_1 = config[configPath[0]];
                    configPath.forEach(function (nextAttribute, index) {
                        if (index !== 0) {
                            value_1 = value_1[nextAttribute];
                        }
                    });
                    if (value_1 !== undefined) {
                        return [2 /*return*/, value_1];
                    }
                    return [2 /*return*/, this.getConfigVar(defaults_1.default, configPath)];
                }
                catch (err) {
                    // else return defaults if config is absent or value is absent.
                    return [2 /*return*/, this.getConfigVar(defaults_1.default, configPath)];
                }
                return [2 /*return*/];
            });
        });
    };
    return Config;
}());
exports.Config = Config;
exports.config = new Config();
