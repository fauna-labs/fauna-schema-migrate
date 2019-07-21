import { Migration } from "..";
import { asyncForEach } from "./utils";
import { Client, query as q } from "faunadb";

type ExecuteMigrationsConfig = {
  client: Client;
  queryBuilder: typeof q;
  migrationId?: string;
};

const executeMigrations = async (
  migrations: Migration[],
  operation: "down" | "up" = "up",
  { client, queryBuilder, migrationId }: ExecuteMigrationsConfig
): Promise<Migration[]> =>
  new Promise(async (resolve, reject) => {
    let completedMigrations: Migration[] = [];
    let currentMigration: Migration | null = null;

    try {
      await asyncForEach(migrations, async (migration: Migration) => {
        currentMigration = migration;
        await client.query(migration[operation](queryBuilder));
        completedMigrations.push(migration);
      });

      if (operation === "up") {
        await client.query(
          q.Create(q.Class("Migration"), {
            data: {
              migrations: completedMigrations.map(migration => migration.label)
            }
          })
        );
      }

      if (operation === "down" && migrationId) {
        await client.query(q.Delete(q.Ref(q.Class("Migration"), migrationId)));
      }

      resolve(completedMigrations);
    } catch (error) {
      reject({
        ...error,
        migration: currentMigration
      });
    }
  });

export default executeMigrations;
