import { Client } from "faunadb";
declare const rollback: (migrationFolder: string, client: Client) => Promise<void>;
export default rollback;
