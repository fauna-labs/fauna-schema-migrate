import * as fauna from 'faunadb';
import { MigrationRefAndTimestamp } from '../types/expressions';
export declare const createMigrationCollection: (client: fauna.Client) => Promise<object>;
export declare const retrieveLastCloudMigration: (client: fauna.Client) => Promise<any>;
export declare const retrieveAllCloudMigrations: (client: fauna.Client) => Promise<MigrationRefAndTimestamp[]>;
