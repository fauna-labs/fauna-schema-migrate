"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var handleError = function (error) {
    var errorMessage = error.message;
    if (error.migration) {
        errorMessage = error.message + " in " + error.migration.label;
    }
    console.log(chalk_1.default.red(chalk_1.default.bold("Error") + ": " + errorMessage));
    console.log(JSON.stringify(error, null, 2));
};
exports.default = handleError;
