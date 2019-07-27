import { Client } from "faunadb";
declare const migrate: (migrationFolder: string, client: Client) => Promise<void>;
export default migrate;
