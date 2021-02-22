import { TaggedExpression } from "../types/expressions";
export declare class DeletedReferenceError extends Error {
    constructor(te_referenced: TaggedExpression, te: TaggedExpression);
}
