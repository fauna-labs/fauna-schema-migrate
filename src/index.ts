#!/usr/bin/env node

import program from "commander";
import chalk from "chalk";
import faunadb, { query as q, Expr } from "faunadb";
import fs from "fs";
import fse from "fs-extra";
import util from "util";
import { MigrationConfig, Migration } from "..";
import runMigrations from "./runMigrations";
const DATABASE_SECRET = process.env.FAUNA_SECRET || "";
const MIGRATION_FOLDER = "./migrations";
const client = new faunadb.Client({ secret: DATABASE_SECRET });

type MigrationInstance = {
  ref: faunadb.values.Ref;
  data: {
    migrations: string[];
  };
};

type MigrationPaginateData = {
  data: MigrationInstance[];
};

program.version("0.0.1").description("Fauna migrate tool");

program
  .command("setup")
  .description("Setup migrations")
  .action(async () => {
    try {
      console.log("Setup migrations...");
      await client.query(q.CreateClass({ name: "Migration" }));
      await client.query(
        q.CreateIndex({ name: "all_migrations", source: q.Class("Migration") })
      );
      console.log(chalk.green("Migration setup completed"));
    } catch (error) {
      console.error(chalk.red(`${chalk.bold("Error")}: ${error.message}`));
    }
  });

program
  .command("create <migrationName>")
  .description("Create a migration file")
  .action((migrationName: string) => {
    const templateContent = fs.readFileSync(
      `${__dirname}/../src/migration.template`,
      "utf8"
    );

    const migrationFilename = `${Date.now()}_${migrationName}.js`;
    const migrationFilepath = `${MIGRATION_FOLDER}/${migrationFilename}`;

    fse.outputFileSync(migrationFilepath, templateContent);

    console.log(
      chalk.green(
        `${chalk.bold(migrationName)} migration created in ${migrationFilepath}`
      )
    );
  });

program
  .command("migrate")
  .description("Run migrations")
  .action(async () => {
    try {
      console.log("Running migrations...");

      const filenames: string[] = fs.readdirSync(MIGRATION_FOLDER).sort();
      const migrations: Migration[] = filenames.map(
        (filename: string): Migration => {
          const modulePath = `${process.cwd()}/${MIGRATION_FOLDER}/${filename}`;
          const migrationModule: MigrationConfig = require(modulePath);
          return {
            ...migrationModule,
            label: filename
          };
        }
      );

      const appliedMigrations: MigrationPaginateData = await client.query(
        q.Map(
          q.Paginate(q.Match(q.Index("all_migrations"))),
          q.Lambda("ref", q.Get(q.Var("ref")))
        )
      );

      let appliedMigrationsName = appliedMigrations.data
        .map((migrationInstance: MigrationInstance) => {
          return migrationInstance.data.migrations;
        })
        .flat();

      const notAppliedMigrations = migrations.filter((migration: Migration) => {
        return !appliedMigrationsName.includes(migration.label);
      });

      if (notAppliedMigrations.length === 0) {
        console.log(chalk.green("All migrations are applied"));
        return;
      }

      const completedMigrations: Migration[] = await runMigrations(
        notAppliedMigrations,
        "up",
        { client, queryBuilder: q }
      );
      console.log("Migrations completed with success:");
      completedMigrations.forEach((migration: Migration) => {
        console.log(chalk.green(`- ${migration.label}`));
      });
    } catch (error) {
      if (!error.migration) {
        console.error(`Error: ${error.message}`);
        return;
      }
      console.error(`Error: ${error.message} in ${error.migration.label}`);
    }
  });

program
  .command("rollback")
  .description("Run rollback")
  .action(async () => {
    try {
      console.log("Running rollback...");

      const filenames: string[] = fs.readdirSync(MIGRATION_FOLDER).sort();
      const migrations: Migration[] = filenames.map(
        (filename: string): Migration => {
          const modulePath = `${process.cwd()}/${MIGRATION_FOLDER}/${filename}`;
          const migrationModule: MigrationConfig = require(modulePath);
          return {
            ...migrationModule,
            label: filename
          };
        }
      );

      const appliedMigrations: MigrationPaginateData = await client.query(
        q.Map(
          q.Paginate(q.Match(q.Index("all_migrations"))),
          q.Lambda("ref", q.Get(q.Var("ref")))
        )
      );

      const lastAppliedMigration: MigrationInstance =
        appliedMigrations.data[appliedMigrations.data.length - 1];

      if (!lastAppliedMigration) {
        console.log("No rollbacks to migrate");
        return;
      }

      const rollbackMigrations = migrations.filter((migration: Migration) => {
        return lastAppliedMigration.data.migrations.includes(migration.label);
      });

      const completedMigrations: Migration[] = await runMigrations(
        rollbackMigrations,
        "down",
        { client, queryBuilder: q, migrationId: lastAppliedMigration.ref.id }
      );
      console.log("Rollback completed with success:");
      completedMigrations.forEach((migration: Migration) => {
        console.log(chalk.green(`- ${migration.label}`));
      });
    } catch (error) {
      console.error(`Error: ${error.message} in ${error.migration.label}`);
    }
  });

program.parse(process.argv);

// const NewClassUser: Migration = createMigration("New Class User", {
//   up: (q: typeof queryBuilder): Expr => {
//     return q.CreateClass({ name: "User" });
//   },
//   down: (q: typeof queryBuilder): Expr => {
//     return q.Delete(q.Class("User"));
//   }
// });

// const NewClassTeam: Migration = createMigration("New Class Team", {
//   up: (q: typeof queryBuilder): Expr => {
//     return q.CreateClass({ name: "Team" });
//   },
//   down: (q: typeof queryBuilder): Expr => {
//     return q.Delete(q.Class("Team"));
//   }
// });

// const migrate = async () => {
//   try {
//     console.log("Running migrations...");
//     const migrations: Migration[] = [NewClassUser, NewClassTeam];
//     const completedMigrations: Migration[] = await runMigrations(
//       migrations,
//       "up",
//       { client, queryBuilder }
//     );
//     console.log("Migrations completed!");
//     completedMigrations.forEach(completedMigration => {
//       console.log("->", completedMigration.name);
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };

// const rollback = async () => {
//   try {
//     console.log("Running roolback...");
//     const migrations: Migration[] = [NewClassUser, NewClassTeam];
//     const completedMigrations: Migration[] = await runMigrations(
//       migrations,
//       "down",
//       { client, queryBuilder }
//     );
//     console.log("Rollback completed!");
//     completedMigrations.forEach(completedMigration => {
//       console.log("->", completedMigration.name);
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };

// rollback();
