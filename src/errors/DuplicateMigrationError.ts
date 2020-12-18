import { TaggedExpression } from "../types/expressions";

export class DuplicateMigrationError extends Error {
    constructor(m: TaggedExpression) {
        const message = `A duplicate migration exists with the type ${m.type}("${m.name}")`
        super(message);

        Object.setPrototypeOf(this, DuplicateMigrationError.prototype);
    }
}