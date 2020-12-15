import { TaggedExpression } from "../types/expressions";

export class TriedDeletingMissingCloudResourceError extends Error {
    constructor(m: TaggedExpression) {
        const message = `Migration calculation requires a deletion to a resource ${m.name} of type ${m.type} which is no longer present in cloud`
        // TODO, his one can actually be safely ignored
        super(message);

        Object.setPrototypeOf(this, TriedDeletingMissingCloudResourceError.prototype);
    }
}