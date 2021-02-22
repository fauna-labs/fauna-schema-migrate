import { MigrationRefAndTimestamp, TaggedExpression, ApplyTargetCurrentAndSkippedMigrations } from "../types/expressions";
import * as fauna from 'faunadb';
export interface NameToDependencyNames {
    [type: string]: string[];
}
export interface NameToExpressions {
    [type: string]: TaggedExpression;
}
export interface NameToBool {
    [type: string]: boolean;
}
export interface NameToVar {
    [type: string]: string;
}
export interface DependenciesArrayEl {
    indexedName: string;
    dependencyIndexNames: string[];
}
export declare const retrieveDatabaseMigrationInfo: (currentMigration: null | MigrationRefAndTimestamp, targetMigration: string) => Promise<TaggedExpression[]>;
export declare const retrieveMigrationInfo: (client: fauna.Client, atChildDbPath?: string[]) => Promise<{
    allCloudMigrations: MigrationRefAndTimestamp[];
    allLocalMigrations: string[];
}>;
export declare const getCurrentAndTargetMigration: (localMigrations: string[], cloudMigrations: MigrationRefAndTimestamp[], amount: number) => Promise<ApplyTargetCurrentAndSkippedMigrations>;
export declare const retrieveDiffCurrentTarget: (atChildDbPath: string[], currentMigration: null | MigrationRefAndTimestamp, targetMigration: string) => Promise<import("../types/expressions").PlannedDiffPerResource>;
export declare const generateApplyQuery: (expressions: TaggedExpression[], skippedMigrations: string[], targetMigration: string) => Promise<fauna.Expr>;
