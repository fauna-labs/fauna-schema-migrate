import { prettyPrintExpr } from "../fql/print";
import { TaggedExpression } from "../types/expressions";
import { ResourceTypes } from "../types/resource-types";

export class WrongResourceTypeError extends Error {
    constructor(expr: TaggedExpression) {
        const message = `
        Only statements that start with the functions:
          ${listCreateResourceTypes().join('\n          ')}
        are allowed in the RESOURCES folder.
        Received Statement
        --------------
        ${prettyPrintExpr(expr.fqlExpr)}
        --------------
        `
        super(message);

        Object.setPrototypeOf(this, WrongResourceTypeError.prototype);
    }
}

const listCreateResourceTypes = () => {
    const res: string[] = []
    for (let r in ResourceTypes) {
        res.push("Create" + r)
    }
    return res
}