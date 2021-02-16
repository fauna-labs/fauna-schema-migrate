import * as fauna from 'faunadb';
export interface FaunaClients {
    [type: string]: {
        name?: string;
        children: FaunaClients;
        client: fauna.Client | false;
    };
}
