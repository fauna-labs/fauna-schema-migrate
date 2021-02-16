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
exports.runTask = exports.runTaskByName = exports.tasks = void 0;
var init_1 = __importDefault(require("./init"));
var apply_1 = __importDefault(require("./apply"));
var migrate_1 = __importDefault(require("./migrate"));
var run_1 = __importDefault(require("./run"));
var interactive_shell_1 = require("../interactive-shell/interactive-shell");
var messages_1 = require("../interactive-shell/messages/messages");
var rollback_1 = __importDefault(require("./rollback"));
exports.tasks = [
    {
        name: "run",
        description: "Run interactively",
        action: run_1.default
    },
    {
        name: "init",
        description: "Initializing folders, config and migration collection",
        action: init_1.default
    },
    // {
    //     name: "new-migration",
    //     description: "Create a new migration",
    //     action: newMigration
    // },
    {
        name: "generate",
        description: "Generate migration from your resources",
        action: migrate_1.default
    },
    {
        name: "rollback",
        description: "Rollback applied migrations in the database",
        action: rollback_1.default,
        // todo implement options
        defaultOptions: { amount: 1 }
    },
    // {
    //     name: "validate",
    //     description: "TODO: validate whether migrations are compatible with database.",
    //     action: validate
    //     // options? ....
    // },
    {
        name: "apply",
        description: "Apply unapplied migrations against the database",
        action: apply_1.default,
        // todo implement options
        defaultOptions: { amount: 1 }
    }
];
var runTaskByName = function (name, options) { return __awaiter(void 0, void 0, void 0, function () {
    var task;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                task = exports.tasks.filter(function (t) { return t.name === name; });
                if (!(task.length > 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, exports.runTask(task[0], task[0].name === 'run', options)];
            case 1: return [2 /*return*/, _a.sent()];
            case 2: throw new Error("there is no task with name " + name);
        }
    });
}); };
exports.runTaskByName = runTaskByName;
var runTask = function (task, interactive, options) {
    if (interactive === void 0) { interactive = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    interactive_shell_1.interactiveShell.start(interactive);
                    if (task.name !== 'run') {
                        interactive_shell_1.interactiveShell.addMessage(messages_1.startCommand(task));
                    }
                    return [4 /*yield*/, task.action(options || task.defaultOptions, interactive)];
                case 1:
                    result = _a.sent();
                    if (task.name !== 'run') {
                        interactive_shell_1.interactiveShell.addMessage(messages_1.endTaskLine());
                    }
                    if (!interactive) {
                        interactive_shell_1.interactiveShell.close();
                    }
                    return [2 /*return*/, result];
            }
        });
    });
};
exports.runTask = runTask;
