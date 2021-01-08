import { ReferencedResource, TaggedExpression } from "../types/expressions";

export class DeletedReferenceError extends Error {
    constructor(te_referenced: TaggedExpression, te: TaggedExpression) {
        const message = `
The following resource was deleted
    type: ${te_referenced.type}, name: ${te_referenced.name}
yet was referenced from:
    type: ${te.type}, name: ${te.name}
        `
        super(message);

        Object.setPrototypeOf(this, DeletedReferenceError.prototype);
    }
}