#!/usr/bin/env node
import setupMigrations from "./setupMigrations";
import createMigration from "./createMigration";
import migrate from "./migrate";
import rollback from "./rollback";
declare const MIGRATION_FOLDER = "./migrations";
export { setupMigrations, createMigration, migrate, rollback, MIGRATION_FOLDER };
