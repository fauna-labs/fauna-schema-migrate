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
exports.clientGenerator = exports.FaunaClientGenerator = void 0;
var fauna = __importStar(require("faunadb"));
var interactive_shell_1 = require("../interactive-shell/interactive-shell");
var files_1 = require("./files");
var _a = fauna.query, CreateKey = _a.CreateKey, Database = _a.Database, Select = _a.Select, CreateDatabase = _a.CreateDatabase, If = _a.If, Exists = _a.Exists, Delete = _a.Delete;
var FaunaClientGenerator = /** @class */ (function () {
    function FaunaClientGenerator() {
        this.faunaClients = null;
        this.getClient = this.getClient.bind(this);
    }
    FaunaClientGenerator.prototype.getClient = function (database, reinit, key) {
        return __awaiter(this, void 0, void 0, function () {
            var secret, client, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        secret = key || process.env.FAUNA_ADMIN_KEY;
                        client = false;
                        if (!!secret) return [3 /*break*/, 2];
                        interactive_shell_1.interactiveShell.requestAdminKey();
                        return [4 /*yield*/, interactive_shell_1.interactiveShell.getUserInput()];
                    case 1:
                        secret = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!(!this.faunaClients || reinit)) return [3 /*break*/, 4];
                        _a = this;
                        return [4 /*yield*/, getAllFaunaClients(secret)];
                    case 3:
                        _a.faunaClients = _b.sent();
                        _b.label = 4;
                    case 4:
                        if (!!database) return [3 /*break*/, 5];
                        client = this.faunaClients.root.client;
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, getDatabaseClient(database, this.faunaClients)];
                    case 6:
                        client = _b.sent();
                        _b.label = 7;
                    case 7:
                        if (!client) {
                            throw new Error("Requested database that was not initialised " + database);
                        }
                        else {
                            return [2 /*return*/, client];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    FaunaClientGenerator.prototype.destroyChildDb = function () {
        return __awaiter(this, void 0, void 0, function () {
            var secret, client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!process.env.FAUNA_CHILD_DB) {
                            throw new Error("Asked to destroy child db, but FAUNA_CHILD_DB env is undefined");
                        }
                        secret = process.env.FAUNA_ADMIN_KEY;
                        if (!!secret) return [3 /*break*/, 2];
                        interactive_shell_1.interactiveShell.requestAdminKey();
                        return [4 /*yield*/, interactive_shell_1.interactiveShell.getUserInput()];
                    case 1:
                        secret = _a.sent();
                        _a.label = 2;
                    case 2:
                        client = createClientWithOptions(secret);
                        return [4 /*yield*/, client.query(If(Exists(Database(process.env.FAUNA_CHILD_DB)), Delete(Database(process.env.FAUNA_CHILD_DB)), true))];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return FaunaClientGenerator;
}());
exports.FaunaClientGenerator = FaunaClientGenerator;
// We'll get all Fauna clients in advance instead of
// creating them each time and going from client to client for every get of a client.
var getAllFaunaClients = function (secret) { return __awaiter(void 0, void 0, void 0, function () {
    var resourcePaths, rootClient, key, faunaClients, _i, resourcePaths_1, p;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, files_1.retrieveAllResourceChildDb()];
            case 1:
                resourcePaths = _a.sent();
                resourcePaths.sort(function (a, b) {
                    return a.length - b.length;
                });
                if (!!secret) return [3 /*break*/, 3];
                interactive_shell_1.interactiveShell.requestAdminKey();
                return [4 /*yield*/, interactive_shell_1.interactiveShell.getUserInput()];
            case 2:
                secret = _a.sent();
                _a.label = 3;
            case 3:
                rootClient = createClientWithOptions(secret);
                if (!process.env.FAUNA_CHILD_DB) return [3 /*break*/, 5];
                return [4 /*yield*/, getChildDbKey(rootClient, process.env.FAUNA_CHILD_DB, true)];
            case 4:
                key = _a.sent();
                rootClient = createClientWithOptions(key.secret);
                _a.label = 5;
            case 5:
                faunaClients = {
                    root: { client: rootClient, children: {} }
                };
                _i = 0, resourcePaths_1 = resourcePaths;
                _a.label = 6;
            case 6:
                if (!(_i < resourcePaths_1.length)) return [3 /*break*/, 9];
                p = resourcePaths_1[_i];
                return [4 /*yield*/, addPath(faunaClients.root, p)];
            case 7:
                _a.sent();
                _a.label = 8;
            case 8:
                _i++;
                return [3 /*break*/, 6];
            case 9: return [2 /*return*/, faunaClients];
        }
    });
}); };
var getChildDbKey = function (client, name, create) {
    if (create === void 0) { create = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!client) return [3 /*break*/, 2];
                    return [4 /*yield*/, client.query(If(Exists(Database(name)), CreateKey({ database: Database(name), role: 'admin' }), create ? CreateKey({
                            database: Select(['ref'], CreateDatabase({ name: name })),
                            role: 'admin'
                        }) : false))];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [2 /*return*/, false];
            }
        });
    });
};
var addPath = function (faunaClients, p) { return __awaiter(void 0, void 0, void 0, function () {
    var childDbName, childDbName, key, childDbClient;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(p.length > 1)) return [3 /*break*/, 2];
                childDbName = p[0];
                return [4 /*yield*/, addPath(faunaClients.children[childDbName], p.slice(1))];
            case 1:
                _a.sent();
                return [3 /*break*/, 4];
            case 2:
                childDbName = p[0];
                return [4 /*yield*/, getChildDbKey(faunaClients.client, childDbName)];
            case 3:
                key = _a.sent();
                if (key) {
                    childDbClient = createClientWithOptions(key.secret);
                    faunaClients.children[childDbName] = { name: childDbName, client: childDbClient, children: {} };
                }
                else {
                    faunaClients.children[childDbName] = { name: childDbName, client: false, children: {} };
                }
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
var getDatabaseClient = function (database, children) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, key, childDbClient;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                client = children.root.client;
                children = children.root.children;
                _a.label = 1;
            case 1:
                if (!(database.length > 0)) return [3 /*break*/, 5];
                db = database.slice(0, 1)[0];
                database = database.slice(1, database.length);
                if (!(children[db] && children[db].client)) return [3 /*break*/, 2];
                client = children[db].client;
                children = children[db].children;
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, getChildDbKey(client, db)];
            case 3:
                key = _a.sent();
                if (key) {
                    childDbClient = createClientWithOptions(key.secret);
                    children[db] = { client: childDbClient, children: {} };
                    client = childDbClient;
                }
                else {
                    client = false;
                }
                _a.label = 4;
            case 4: return [3 /*break*/, 1];
            case 5: return [2 /*return*/, client];
        }
    });
}); };
var createClientWithOptions = function (secret) {
    var opts = { secret: secret, keepAlive: false };
    if (process.env.FAUNADB_DOMAIN)
        opts.domain = process.env.FAUNADB_DOMAIN;
    if (process.env.FAUNADB_SCHEME)
        opts.scheme = process.env.FAUNADB_SCHEME;
    return new fauna.Client(opts);
};
exports.clientGenerator = new FaunaClientGenerator();
