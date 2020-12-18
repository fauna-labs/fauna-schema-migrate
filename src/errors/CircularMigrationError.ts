import { TaggedExpression } from "../types/expressions";

export class CircularMigrationError extends Error {
    constructor(m: TaggedExpression[]) {
        const names = m.map((e) => `${e.type}("${e.name}")`)
        const message = `The following migrations can not be placed in a transaction since they contain circular dependencies
  ${names.join('\n  ')}
        `
        super(message);

        Object.setPrototypeOf(this, CircularMigrationError.prototype);
    }
}