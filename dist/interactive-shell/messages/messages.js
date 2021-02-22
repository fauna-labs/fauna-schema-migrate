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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askAdminKey = exports.renderMigrationState = exports.renderResource = exports.renderResourceType = exports.renderPlan = exports.renderHeader = exports.notifyTaskProcessing = exports.notifyTaskCompleted = exports.notifyWarning = exports.notifyBoxedInfo = exports.notifyBoxedCode = exports.notifyUnexpectedError = exports.startCommand = exports.endTaskLine = void 0;
var React = __importStar(require("react"));
var ink_1 = require("ink");
var ink_gradient_1 = __importDefault(require("ink-gradient"));
var ink_big_text_1 = __importDefault(require("ink-big-text"));
var ink_divider_1 = __importDefault(require("ink-divider"));
var colors_1 = require("../colors");
var ink_link_1 = __importDefault(require("ink-link"));
var ink_spinner_1 = __importDefault(require("ink-spinner"));
var ink_syntax_highlight_1 = __importDefault(require("ink-syntax-highlight"));
var resource_types_1 = require("../../types/resource-types");
var version = require('./../../../package.json').version;
var endTaskLine = function () {
    return function (id) {
        return React.createElement(ink_1.Box, { key: "divider_container_" + id, height: 2, width: 50, flexDirection: "column" },
            React.createElement(ink_divider_1.default, { dividerColor: colors_1.lightgray, key: "divider_" + id }));
    };
};
exports.endTaskLine = endTaskLine;
var startCommand = function (task) {
    return function (id) {
        return React.createElement(ink_1.Box, { key: "task_" + id, flexDirection: 'column', marginBottom: 1 },
            React.createElement(ink_1.Text, null,
                " Executing command: ",
                task.description,
                " "));
    };
};
exports.startCommand = startCommand;
var notifyUnexpectedError = function (error) {
    return function (id) {
        return React.createElement(ink_1.Box, { marginLeft: 3, key: "error_" + id, flexDirection: "column" },
            React.createElement(ink_1.Box, null,
                React.createElement(ink_1.Text, { color: colors_1.faunaPurple1, bold: true }, " ! "),
                React.createElement(ink_1.Text, { color: "red" }, error.toString())),
            React.createElement(ink_1.Box, { marginLeft: 3, width: 80, borderStyle: "round", key: "error_stack_" + id },
                React.createElement(ink_1.Text, null, error.stack ? error.stack : JSON.stringify(error, null, 2))));
    };
};
exports.notifyUnexpectedError = notifyUnexpectedError;
var notifyBoxedCode = function (message) {
    return function (id) {
        return React.createElement(ink_1.Box, { marginLeft: 6, key: "info_" + id, borderStyle: "round" },
            React.createElement(ink_syntax_highlight_1.default, { code: message, language: "js" }));
    };
};
exports.notifyBoxedCode = notifyBoxedCode;
var notifyBoxedInfo = function (message) {
    return function (id) {
        return React.createElement(ink_1.Box, { marginLeft: 6, key: "info_" + id, borderStyle: "round" },
            React.createElement(ink_1.Text, null, message));
    };
};
exports.notifyBoxedInfo = notifyBoxedInfo;
var notifyWarning = function (message) {
    return function (id) {
        return React.createElement(ink_1.Box, { marginLeft: 3, key: "warning_" + id },
            React.createElement(ink_1.Text, { color: "orange", bold: true }, " ! "),
            React.createElement(ink_1.Text, { color: colors_1.white }, message));
    };
};
exports.notifyWarning = notifyWarning;
var notifyTaskCompleted = function (message) {
    return function (id) {
        return React.createElement(ink_1.Box, { marginLeft: 3, key: "task_completed_" + id },
            React.createElement(ink_1.Text, { color: colors_1.faunaPurple1, bold: true }, " \u2714 "),
            React.createElement(ink_1.Text, { color: colors_1.white }, message));
    };
};
exports.notifyTaskCompleted = notifyTaskCompleted;
var notifyTaskProcessing = function (message) {
    return React.createElement(ink_1.Box, { marginLeft: 4, key: "task_processing" },
        React.createElement(ink_spinner_1.default, { type: "dots" }),
        React.createElement(ink_1.Text, { color: colors_1.white },
            " ",
            message));
};
exports.notifyTaskProcessing = notifyTaskProcessing;
var renderHeader = function () {
    var title = "Fauna";
    var subtitle = "Schema Migrate " + version;
    return function (id) { return React.createElement(ink_1.Box, { key: "header_container_" + id, height: 5, width: 100, flexDirection: "column" },
        React.createElement(ink_1.Box, { key: "header_" + id, flexDirection: "row" },
            React.createElement(ink_gradient_1.default, { colors: [colors_1.faunaPurple1, colors_1.faunaPurple2] },
                React.createElement(ink_big_text_1.default, { font: "tiny", text: title, lineHeight: 2 })),
            React.createElement(ink_1.Box, { marginLeft: 2, height: "100%", paddingTop: 3 },
                React.createElement(ink_1.Text, null, subtitle))),
        React.createElement(ink_divider_1.default, { dividerColor: colors_1.faunaPurple2, key: "divider_" + id })); };
};
exports.renderHeader = renderHeader;
var renderPlan = function (plan) {
    return function (id) {
        var index = 0;
        var toDisplay = [];
        var _loop_1 = function (item) {
            var toDisplayPerResource = [];
            index++;
            var changesPerResource = plan[item];
            changesPerResource.added.forEach(function (r) {
                toDisplayPerResource.push(exports.renderResource(index, r.target, 'added', id));
                index++;
            });
            changesPerResource.changed.forEach(function (r) {
                toDisplayPerResource.push(exports.renderResource(index, r.target, 'changed', id));
                index++;
            });
            changesPerResource.deleted.forEach(function (r) {
                toDisplayPerResource.push(exports.renderResource(index, r.previous, 'deleted', id));
                index++;
            });
            toDisplay.push(exports.renderResourceType(index, item, toDisplayPerResource, id));
            toDisplayPerResource = [];
        };
        for (var item in resource_types_1.ResourceTypes) {
            _loop_1(item);
        }
        return React.createElement(ink_1.Box, { flexDirection: "column", key: "plan_" + id }, toDisplay);
    };
};
exports.renderPlan = renderPlan;
var renderResourceType = function (index, type, toDisplayPerResource, id) {
    if (toDisplayPerResource.length > 0) {
        return React.createElement(ink_1.Box, { flexDirection: "row", marginLeft: 6, key: "resource_" + id + "_" + index },
            React.createElement(ink_1.Box, { width: 16 },
                React.createElement(ink_1.Box, null,
                    React.createElement(ink_1.Text, { bold: true }, type))),
            React.createElement(ink_1.Box, { flexDirection: "column", paddingTop: 0 }, toDisplayPerResource));
    }
    else {
        return null;
    }
};
exports.renderResourceType = renderResourceType;
var renderResource = function (index, resource, type, id) {
    return React.createElement(ink_1.Text, { key: "resource_" + id + "_" + index },
        type,
        ": ", resource === null || resource === void 0 ? void 0 :
        resource.name);
};
exports.renderResource = renderResource;
var renderMigrationState = function (allCloudMigrations, localMigrations, direction, amount) {
    return function (id) { return React.createElement(ink_1.Box, { marginLeft: 6, key: "migration_state_" + id, flexDirection: "column", borderStyle: "round" }, renderMigrationItems(allCloudMigrations, localMigrations, id, direction, amount)); };
};
exports.renderMigrationState = renderMigrationState;
var renderMigrationItems = function (allCloudMigrations, localMigrations, id, direction, amount) {
    var result = [];
    if (allCloudMigrations.length == 0) {
        result.push(renderMigrationItem("migration_item_" + id + "_" + -1, " ".repeat(24), "cloud state"));
    }
    if (direction == "rollback") {
        if (allCloudMigrations.length - amount < 0 && allCloudMigrations.length !== 0) {
            result.push(renderMigrationItem("migration_item_" + id + "_" + -1, " ".repeat(24), "rollback target"));
        }
        localMigrations.forEach(function (l, index) {
            if (index === allCloudMigrations.length - amount - 1) {
                result.push(renderMigrationItem("migration_item_" + id + "_" + -1, l, "rollback target"));
            }
            else if (index === allCloudMigrations.length - 1) {
                result.push(renderMigrationItem("migration_item_" + id + "_" + index, l, "cloud state"));
            }
            else {
                result.push(renderMigrationItem("migration_item_" + id + "_" + index, l, ""));
            }
        });
    }
    else if (direction == "apply") {
        localMigrations.forEach(function (l, index) {
            if (index === allCloudMigrations.length + amount - 1) {
                result.push(renderMigrationItem("migration_item_" + id + "_" + -1, l, "apply target"));
            }
            else if (index === allCloudMigrations.length - 1) {
                result.push(renderMigrationItem("migration_item_" + id + "_" + index, l, "cloud state"));
            }
            else {
                result.push(renderMigrationItem("migration_item_" + id + "_" + index, l, ""));
            }
        });
    }
    else {
        localMigrations.forEach(function (l, index) {
            if (index === allCloudMigrations.length - 1) {
                result.push(renderMigrationItem("migration_item_" + id + "_" + index, l, "cloud state"));
            }
            else {
                result.push(renderMigrationItem("migration_item_" + id + "_" + index, l, ""));
            }
        });
        if (allCloudMigrations.length == localMigrations.length) {
            result.push(renderMigrationItem("migration_item_" + id + "_" + -1, " ".repeat(24), "apply target"));
        }
    }
    return result;
};
var renderMigrationItem = function (id, migrationItem, type) {
    return React.createElement(ink_1.Text, { key: id + "_" + migrationItem + "_" + type },
        React.createElement(ink_1.Text, null, migrationItem),
        " ",
        type ? React.createElement(ink_1.Text, null,
            " \u2190 ",
            type) : "");
};
var askAdminKey = function () {
    return function (id) { return askQuestion(id, React.createElement(ink_1.Text, null,
        "Please provide a FaunaDB admin key or set the ",
        React.createElement(ink_1.Text, { color: colors_1.faunaPurple2 }, " FAUNA_ADMIN_KEY "),
        " environment and restart the tool.",
        React.createElement(ink_1.Newline, null),
        "To retrieve an admin key for your database, use the Security tab in dashboard",
        React.createElement(ink_link_1.default, { url: "https://dashboard.fauna.com/" }, "https://dashboard.fauna.com/"))); };
};
exports.askAdminKey = askAdminKey;
var askQuestion = function (id, content) {
    return React.createElement(ink_1.Box, { marginLeft: 6, height: "100%", marginTop: 1, marginBottom: 1, key: "question_" + id },
        React.createElement(ink_1.Text, { key: "question_" + id }, content));
};
