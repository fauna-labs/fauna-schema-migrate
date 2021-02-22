import { PlannedDiffPerResource, TaggedExpression } from "../types/expressions";
export declare const writeMigrations: (atChildDbPath: string[] | undefined, migrations: TaggedExpression[], time: string) => Promise<void>;
export declare const generateMigrations: (planned: PlannedDiffPerResource) => Promise<TaggedExpression[]>;
