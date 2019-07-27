import { Client } from "faunadb";
declare const getAppliedMigrations: (client: Client) => Promise<object>;
export default getAppliedMigrations;
