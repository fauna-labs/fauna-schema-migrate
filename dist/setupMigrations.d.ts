import { Client } from "faunadb";
declare const setupMigrations: (client: Client) => Promise<void>;
export default setupMigrations;
