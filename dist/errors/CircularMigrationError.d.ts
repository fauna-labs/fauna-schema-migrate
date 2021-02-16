import { TaggedExpression } from "../types/expressions";
export declare class CircularMigrationError extends Error {
    constructor(m: TaggedExpression[]);
}
