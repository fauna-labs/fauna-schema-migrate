import * as fauna from 'faunadb';
import { MigrationRefAndTimestamp, PlannedDiffPerResource, TaggedExpression, RollbackTargetCurrentAndSkippedMigrations } from '../types/expressions';
export declare const retrieveRollbackMigrations: (cloudMigrations: MigrationRefAndTimestamp[], amount: number, atChildDbPath: string[]) => Promise<{
    allLocalMigrations: string[];
    toRollback: RollbackTargetCurrentAndSkippedMigrations;
}>;
export declare const generateRollbackQuery: (expressions: TaggedExpression[], skippedMigrations: MigrationRefAndTimestamp[], currentMigration: MigrationRefAndTimestamp) => Promise<fauna.Expr>;
export declare const retrieveDiffCurrentTarget: (currentMigration: MigrationRefAndTimestamp, targetMigration: null | MigrationRefAndTimestamp, atChildPath: string[]) => Promise<PlannedDiffPerResource>;
