import { TaggedExpression } from "../types/expressions";
export declare class DuplicateMigrationError extends Error {
    constructor(m: TaggedExpression);
}
