import chalk from "chalk";
import { Client, query as q } from "faunadb";
import { Migration, MigrationInstance } from "./types";;
import executeMigrations from "./executeMigrations";
import getLocalMigrations from "./getLocalMigrations";
import getAppliedMigrations from "./getAppliedMigrations";
import handleError from "./handleError";

const migrate = async (migrationFolder: string, client: Client) => {
  try {
    console.log("Running migrations...");

    const migrations: Migration[] = getLocalMigrations(migrationFolder);
    const appliedMigrations: any = await getAppliedMigrations(client);
    const appliedMigrationsName = appliedMigrations.data
      .map(
        (migrationInstance: MigrationInstance) =>
          migrationInstance.data.migrations
      )
      .flat();
    const notAppliedMigrations = migrations.filter(
      (migration: Migration) => !appliedMigrationsName.includes(migration.label)
    );

    if (notAppliedMigrations.length === 0) {
      console.log(chalk.green("All migrations are applied"));
      return;
    }

    const completedMigrations: Migration[] = await executeMigrations(
      notAppliedMigrations,
      "up",
      { client, queryBuilder: q }
    );

    console.log("Migrations completed with success:");
    completedMigrations.forEach((migration: Migration) => {
      console.log(chalk.green(`- ${migration.label}`));
    });
  } catch (error) {
    handleError(error);
  }
};

export default migrate;
