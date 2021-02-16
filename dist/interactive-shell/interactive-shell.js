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
exports.interactiveShell = exports.ShellState = void 0;
var react_1 = __importDefault(require("react"));
var ink_1 = require("ink");
var react_hookstore_1 = require("react-hookstore");
var shell_1 = __importDefault(require("./components/shell"));
var messages_1 = require("./messages/messages");
var tasks_1 = require("../tasks");
var version = require('./../../package.json').version;
var ShellState;
(function (ShellState) {
    ShellState[ShellState["Menu"] = 0] = "Menu";
    ShellState[ShellState["Executing"] = 1] = "Executing";
    ShellState[ShellState["UserInput"] = 2] = "UserInput";
    ShellState[ShellState["UserInputReceived"] = 3] = "UserInputReceived";
})(ShellState = exports.ShellState || (exports.ShellState = {}));
var InteractiveShell = /** @class */ (function () {
    function InteractiveShell() {
        // Messages is text that remains on screen and is not
        // redrawn, they remain statically on the screen or in other words,
        // are not interactive
        this.messages = react_hookstore_1.createStore('messages', []);
        this.question = react_hookstore_1.createStore('question', null);
        this.task = react_hookstore_1.createStore('task', null);
        this.cliState = react_hookstore_1.createStore('cliState', ShellState.Menu);
        this.result = null;
        this.userInput = "";
        this.start = this.start.bind(this);
        this.close = this.close.bind(this);
        this.handleMenuSelection = this.handleMenuSelection.bind(this);
        this.handleUserInput = this.handleUserInput.bind(this);
    }
    InteractiveShell.prototype.start = function (interactive) {
        if (interactive === void 0) { interactive = true; }
        if (!this.result && process.env.NODE_ENV !== 'test') {
            if (!process.env.FAUNA_LEGACY) {
                this.addMessage(messages_1.renderHeader());
                this.result = ink_1.render(this.renderComponents());
            }
            else {
                var title = "Fauna";
                var subtitle = "Schema Migrate " + version;
                printWithMargin("Fauna Schema Migrate - " + version + "\n    ---------------------------------------", 0);
            }
        }
        if (!interactive) {
            this.cliState.setState(ShellState.Executing);
        }
    };
    InteractiveShell.prototype.close = function () {
        if (this.result) {
            this.result.unmount();
        }
    };
    InteractiveShell.prototype.renderComponents = function () {
        return react_1.default.createElement(shell_1.default, { handleUserInput: this.handleUserInput, handleMenuSelection: this.handleMenuSelection });
    };
    InteractiveShell.prototype.handleMenuSelection = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.cliState.setState(ShellState.Executing);
                        return [4 /*yield*/, tasks_1.runTask(item, true)];
                    case 1:
                        _a.sent();
                        this.cliState.setState(ShellState.Menu);
                        return [2 /*return*/];
                }
            });
        });
    };
    InteractiveShell.prototype.handleUserInput = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.userInput = input;
                this.cliState.setState(ShellState.UserInputReceived);
                return [2 /*return*/];
            });
        });
    };
    InteractiveShell.prototype.startSubtask = function (input) {
        if (process.env.NODE_ENV === 'test' || process.env.FAUNA_LEGACY) {
            console.info('--- Starting subtask', input);
        }
        else {
            this.task.setState(messages_1.notifyTaskProcessing(input));
        }
    };
    InteractiveShell.prototype.printBoxedCode = function (message) {
        if (!process.env.FAUNA_NOPRINT) {
            if (process.env.NODE_ENV === 'test' || process.env.FAUNA_LEGACY) {
                printWithMargin(message, 8);
            }
            else {
                this.addMessage(messages_1.notifyBoxedCode(message));
            }
        }
    };
    InteractiveShell.prototype.printBoxedInfo = function (message) {
        if (process.env.NODE_ENV === 'test' || process.env.FAUNA_LEGACY) {
            printWithMargin(message, 8);
        }
        else {
            this.addMessage(messages_1.notifyBoxedInfo(message));
        }
    };
    InteractiveShell.prototype.completeSubtask = function (input) {
        if (process.env.FAUNA_LEGACY) {
            console.info('--- Finished subtask', input);
        }
        else {
            this.task.setState(null);
            this.addMessage(messages_1.notifyTaskCompleted(input));
        }
    };
    InteractiveShell.prototype.setQuestion = function (q) {
        this.question.setState(q);
    };
    InteractiveShell.prototype.addMessage = function (m) {
        var messages = this.messages.getState();
        this.messages.setState(messages.concat(m));
    };
    InteractiveShell.prototype.requestAdminKey = function () {
        if (process.env.FAUNA_LEGACY) {
            var question = "Please provide a FaunaDB admin key or set the FAUNA_ADMIN_KEY environment and restart the tool.\nTo retrieve an admin key for your database, use the Security tab in dashboard https://dashboard.fauna.com/";
            printWithMargin(question, 4);
        }
        else {
            this.setQuestion(messages_1.askAdminKey());
        }
        this.cliState.setState(ShellState.UserInput);
    };
    InteractiveShell.prototype.reportError = function (err) {
        if (process.env.NODE_ENV === 'test' || process.env.FAUNA_LEGACY) {
            throw err;
        }
        this.task.setState(null);
        this.addMessage(messages_1.notifyUnexpectedError(err));
    };
    InteractiveShell.prototype.reportWarning = function (warn) {
        if (process.env.NODE_ENV === 'test' || process.env.FAUNA_LEGACY) {
            console.warn(warn);
        }
        this.task.setState(null);
        this.addMessage(messages_1.notifyWarning(warn));
    };
    InteractiveShell.prototype.renderMigrations = function (cloudTimestamps, localTimestamps, type, amount) {
        if (process.env.NODE_ENV === 'test' || process.env.FAUNA_LEGACY) {
            printWithMargin("--------- Current cloud migrations----------", 0);
            printWithMargin(cloudTimestamps.join("\n"), 4);
            printWithMargin("--------- Current local migrations ----------", 0);
            printWithMargin(localTimestamps.join("\n"), 4);
            printWithMargin("--------- Task ----------", 0);
            printWithMargin(type + " " + amount + " migrations", 4);
            console.info('\n');
        }
        else {
            this.addMessage(messages_1.renderMigrationState(cloudTimestamps, localTimestamps, type, amount));
        }
    };
    InteractiveShell.prototype.renderPlan = function (plan) {
        if (process.env.NODE_ENV === 'test' || process.env.FAUNA_LEGACY) {
            console.info(JSON.stringify(plan, null, 2));
        }
        else {
            this.addMessage(messages_1.renderPlan(plan));
        }
    };
    InteractiveShell.prototype.getUserInput = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(this.cliState.getState() !== ShellState.UserInputReceived)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 0];
                                case 2: return [2 /*return*/, resolve(this.userInput)];
                            }
                        });
                    }); })];
            });
        });
    };
    return InteractiveShell;
}());
var printWithMargin = function (message, margin) {
    console.info(message
        .split('\n')
        .map(function (e) { return " ".repeat(margin) + e; })
        .join('\n'));
};
var interactiveShell = new InteractiveShell();
exports.interactiveShell = interactiveShell;
