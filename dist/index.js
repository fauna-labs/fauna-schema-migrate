#!/usr/bin/env node
"use strict";
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
exports.program = void 0;
var commander_1 = __importDefault(require("commander"));
exports.program = commander_1.default;
var interactive_shell_1 = require("./interactive-shell/interactive-shell");
var tasks_1 = require("./tasks");
// Global configuration of the CLI
commander_1.default
    .description("Fauna schema migrations")
    .option('-l --legacy', 'set this option or the FAUNA_LEGACY environment var to disable fancy output for legacy terminals or allow easy copying of text')
    .option('-n --no-print', 'set this option or the FAUNA_NOPRINT to omit printing of the FQL transactions which could be big')
    .option('-c --child-db <name>', 'set this option or the FAUNA_CHILD_DB environment var to run the schema migrations in a child db which allows for faster recreation, avoiding the 60s schema cache')
    .option('-k --key <key>', 'set this option or the FAUNA_ADMIN_KEY environment to pass the fauna admin secret, be careful that your keys do not end up in server/CI logs, use FAUNA_ADMIN_KEY if you are not sure!')
    .parse(process.argv);
// Configure all tasks to directly work with commander
var options = commander_1.default.opts();
if (options.key)
    process.env.FAUNA_ADMIN_KEY = options.key;
if (options.childDb)
    process.env.FAUNA_CHILD_DB = options.childDb;
if (options.legacy)
    process.env.FAUNA_LEGACY = options.legacy;
if (options.noPrint)
    process.env.FAUNA_NOPRINT = options.noPrint;
tasks_1.tasks.forEach(function (task) {
    commander_1.default
        .command("" + task.name + (task.options ? ' ' + task.options : ''))
        .description(task.description)
        .action(function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return tasks_1.runTask.apply(void 0, __spreadArrays([task, task.name === 'run'], params));
    });
});
// On unknown command, show the user some help
commander_1.default.on('command:*', function (operands) {
    interactive_shell_1.interactiveShell.start(false);
    interactive_shell_1.interactiveShell.reportWarning("Unknown command '" + operands[0] + "'");
    interactive_shell_1.interactiveShell.printBoxedInfo(commander_1.default.helpInformation());
    interactive_shell_1.interactiveShell.close();
    process.exitCode = 1;
});
if (process.argv.length == 2) {
    console.info(commander_1.default.helpInformation());
    process.exitCode = 1;
}
else {
    commander_1.default.parse(process.argv);
}
