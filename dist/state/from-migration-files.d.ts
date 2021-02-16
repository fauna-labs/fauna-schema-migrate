import { LoadedResourcesAndLastMigration } from '../types/expressions';
export declare const getAllLastDatabases: (before?: string | null, ignoreChildDb?: boolean) => Promise<string[][]>;
export declare const getAllLastMigrationSnippets: (atChildDbPath?: string[], before?: string | null, ignoreChildDb?: boolean) => Promise<LoadedResourcesAndLastMigration>;
