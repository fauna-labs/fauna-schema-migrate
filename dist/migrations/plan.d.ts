import { TaggedExpression, PlannedDiffPerResource } from "../types/expressions";
export declare const planDatabaseMigrations: () => Promise<TaggedExpression[]>;
export declare const planMigrations: (atChildDbPath?: string[], extraDbExpr?: TaggedExpression[]) => Promise<PlannedDiffPerResource>;
