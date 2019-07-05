import faunadb, { query as queryBuilder, Expr } from "faunadb";
const DATABASE_SECRET = "fnADSjD36LACB96FDJUTDD8AJf_LeCCpYXOKlAd6";
const client = new faunadb.Client({ secret: DATABASE_SECRET });

type MigrationConfig = {
  up: (q: typeof queryBuilder) => Expr;
  down: (q: typeof queryBuilder) => Expr;
};

type Migration = MigrationConfig & {
  name: string;
};

const createMigration = (
  name: string,
  migrationConfig: MigrationConfig
): Migration => ({
  name,
  ...migrationConfig
});

const NewClassUser: Migration = createMigration("New Class User", {
  up: (q: typeof queryBuilder): Expr => {
    return q.CreateClass({ name: "User" });
  },
  down: (q: typeof queryBuilder): Expr => {
    return q.Delete(q.Class("User"));
  }
});

const NewClassTeam: Migration = createMigration("New Class Team", {
  up: (q: typeof queryBuilder): Expr => {
    return q.CreateClass({ name: "Team" });
  },
  down: (q: typeof queryBuilder): Expr => {
    return q.Delete(q.Class("Team"));
  }
});

const runMigrations = async (
  migrations: Migration[],
  operation: "down" | "up" = "up"
): Promise<Migration[]> =>
  new Promise(async (resolve, reject) => {
    let completedMigrations: Migration[] = [];

    try {
      await asyncForEach(migrations, async (migration: Migration) => {
        await client.query(migration[operation](queryBuilder));
        completedMigrations.push(migration);
      });

      resolve(completedMigrations);
    } catch (error) {
      reject(error);
    }
  });

const migrate = async () => {
  try {
    console.log("Running migrations...");
    const migrations: Migration[] = [NewClassUser, NewClassTeam];
    const completedMigrations: Migration[] = await runMigrations(migrations);
    console.log("Migrations completed!");
    completedMigrations.forEach(completedMigration => {
      console.log("->", completedMigration.name);
    });
  } catch (error) {
    console.error(error);
  }
};

const rollback = async () => {
  try {
    console.log("Running roolback...");
    const migrations: Migration[] = [NewClassUser, NewClassTeam];
    const completedMigrations: Migration[] = await runMigrations(
      migrations,
      "down"
    );
    console.log("Rollback completed!");
    completedMigrations.forEach(completedMigration => {
      console.log("->", completedMigration.name);
    });
  } catch (error) {
    console.error(error);
  }
};

rollback();

async function asyncForEach(array: any[], callback: any) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
