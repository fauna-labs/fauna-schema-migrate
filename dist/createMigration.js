"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var fs_1 = __importDefault(require("fs"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var createMigration = function (migrationName, migrationFolder, templateContent) {
    if (!templateContent) {
        templateContent = fs_1.default.readFileSync(__dirname + "/migration.template", "utf8");
    }
    var migrationFilename = Date.now() + "_" + migrationName + ".js";
    var migrationFilepath = migrationFolder + "/" + migrationFilename;
    fs_extra_1.default.outputFileSync(migrationFilepath, templateContent);
    console.log(chalk_1.default.green(chalk_1.default.bold(migrationName) + " migration created in " + migrationFilepath));
};
exports.default = createMigration;
