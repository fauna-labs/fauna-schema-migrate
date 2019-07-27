#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = __importDefault(require("commander"));
var faunadb_1 = __importDefault(require("faunadb"));
var setupMigrations_1 = __importDefault(require("./setupMigrations"));
exports.setupMigrations = setupMigrations_1.default;
var createMigration_1 = __importDefault(require("./createMigration"));
exports.createMigration = createMigration_1.default;
var migrate_1 = __importDefault(require("./migrate"));
exports.migrate = migrate_1.default;
var rollback_1 = __importDefault(require("./rollback"));
exports.rollback = rollback_1.default;
var MIGRATION_FOLDER = "./migrations";
exports.MIGRATION_FOLDER = MIGRATION_FOLDER;
var client = new faunadb_1.default.Client({
    secret: String(process.env.FAUNADB_SECRET)
});
commander_1.default.version("0.0.1").description("Fauna migrate tool");
commander_1.default
    .command("setup")
    .description("Setup migrations")
    .action(function () { return setupMigrations_1.default(client); });
commander_1.default
    .command("create <migrationName>")
    .description("Create a migration file")
    .action(function (migrationName) {
    return createMigration_1.default(migrationName, MIGRATION_FOLDER);
});
commander_1.default
    .command("migrate")
    .description("Run migrations")
    .action(function () { return migrate_1.default(MIGRATION_FOLDER, client); });
commander_1.default
    .command("rollback")
    .description("Run rollback")
    .action(function () { return rollback_1.default(MIGRATION_FOLDER, client); });
commander_1.default.parse(process.argv);
