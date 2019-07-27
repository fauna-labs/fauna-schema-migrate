import { Migration } from "..";
import { Client, query as q } from "faunadb";
declare type ExecuteMigrationsConfig = {
    client: Client;
    queryBuilder: typeof q;
    migrationId?: string;
};
declare const executeMigrations: (migrations: Migration[], operation: "up" | "down" | undefined, { client, queryBuilder, migrationId }: ExecuteMigrationsConfig) => Promise<Migration[]>;
export default executeMigrations;
