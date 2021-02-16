import { PlannedMigrations, TaggedExpression } from "../types/expressions";
export declare const writeMigrations: (migrations: TaggedExpression[]) => Promise<void>;
export declare const generateMigrations: (planned: PlannedMigrations) => Promise<TaggedExpression[]>;
