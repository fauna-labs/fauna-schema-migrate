import * as fauna from 'faunadb';
export declare class FaunaClientGenerator {
    private faunaClients;
    constructor();
    getClient(database?: string[], reinit?: boolean, key?: string): Promise<fauna.Client>;
    destroyChildDb(): Promise<fauna.Client>;
}
export declare const clientGenerator: FaunaClientGenerator;
