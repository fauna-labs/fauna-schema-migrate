import { TaggedExpression } from "../types/expressions";
import { ResourceTypes } from "../types/resource-types";

export class WrongCreateTypeError extends Error {
    constructor(type: TaggedExpression) {
        const message = `
        Received Statement ${type.fql}
        Only statements that start with the functions:
          ${listCreateResourceTypes().join('\n          ')}
        are allowed in the resources folder.
        `

        super(message);

        Object.setPrototypeOf(this, WrongCreateTypeError.prototype);
    }
}

const listCreateResourceTypes = () => {
    const res: string[] = []
    for (let r in ResourceTypes) {
        res.push("Create" + r)
    }
    return res
}