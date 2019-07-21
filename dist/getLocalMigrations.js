"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var getLocalMigrations = function (migrationFolder) {
    var filenames = fs_1.default.readdirSync(migrationFolder).sort();
    var migrations = filenames.map(function (filename) {
        var modulePath = process.cwd() + "/" + migrationFolder + "/" + filename;
        var migrationModule = require(modulePath);
        return __assign({}, migrationModule, { label: filename });
    });
    return migrations;
};
exports.default = getLocalMigrations;
