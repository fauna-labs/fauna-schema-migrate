import * as fauna from 'faunadb';
import { LoadedResources } from '../types/expressions';
import { MigrationRefAndTimestamp } from '../types/expressions';
export declare const createMigrationCollection: (client: fauna.Client) => Promise<object>;
export declare const retrieveAllCloudMigrations: (client: fauna.Client) => Promise<MigrationRefAndTimestamp[]>;
export declare const getAllCloudResources: (client: fauna.Client) => Promise<LoadedResources>;
