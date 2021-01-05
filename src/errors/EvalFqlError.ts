import { TaggedExpression } from "../types/expressions";

export class EvalFqlError extends Error {
    constructor(err: Error, fql: String) {
        // Todo JSlint the fql string to get decent errors.
        const message = `
Failed to evaluate FQL expression with SyntaxError:
--------------
${fql}
--------------
        `
        super(message);
        Object.setPrototypeOf(this, EvalFqlError.prototype);
    }
}

