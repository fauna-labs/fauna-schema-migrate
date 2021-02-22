import { TaggedExpression } from "../types/expressions";
export declare class WrongMigrationTypeError extends Error {
    constructor(expr: TaggedExpression);
}
