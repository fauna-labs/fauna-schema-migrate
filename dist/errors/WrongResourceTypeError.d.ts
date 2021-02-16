import { TaggedExpression } from "../types/expressions";
export declare class WrongResourceTypeError extends Error {
    constructor(expr: TaggedExpression);
}
