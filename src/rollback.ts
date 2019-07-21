import chalk from "chalk";
import { query as q, Client } from "faunadb";
import { MigrationInstance, Migration } from "..";
import executeMigrations from "./executeMigrations";
import getLocalMigrations from "./getLocalMigrations";
import getAppliedMigrations from "./getAppliedMigrations";
import handleError from "./handleError";

const rollback = async (migrationFolder: string, client: Client) => {
  try {
    console.log("Running rollback...");

    const migrations: Migration[] = getLocalMigrations(migrationFolder);
    const appliedMigrations: any = await getAppliedMigrations(client);
    const lastAppliedMigration: MigrationInstance =
      appliedMigrations.data[appliedMigrations.data.length - 1];

    if (!lastAppliedMigration) {
      console.log("No rollbacks to migrate");
      return;
    }

    const rollbackMigrations = migrations.filter((migration: Migration) =>
      lastAppliedMigration.data.migrations.includes(migration.label)
    );
    const completedMigrations: Migration[] = await executeMigrations(
      rollbackMigrations,
      "down",
      { client, queryBuilder: q, migrationId: lastAppliedMigration.ref.id }
    );

    console.log("Rollback completed with success:");
    completedMigrations.forEach((migration: Migration) => {
      console.log(chalk.green(`- ${migration.label}`));
    });
  } catch (error) {
    handleError(error);
  }
};

export default rollback;
