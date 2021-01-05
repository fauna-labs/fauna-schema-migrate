import { PreviousAndCurrent, TaggedExpression } from "../types/expressions";

export class UpdateIndexError extends Error {
    constructor(m: PreviousAndCurrent[]) {
        const names = m.map((e) => {
            return '- ' + e.current?.name
        })
        const message = `Tried to update indexes with names:
        ${names.join('\n  ')}

        Indexes can't be updated and have to be recreated.
        A workaround procedure to replace an index is to:
        1. Migration1:
        - Create a new index with a new name
        2. Manual:
        - Wait for the index to be active (the active boolean on the index has to be true)
        3. Migration2:
        - Update your FQL (e.g. your UDFs or update your application code) to use the new index
        - Once everything is using the new index, delete the old index
        `
        super(message);

        Object.setPrototypeOf(this, UpdateIndexError.prototype);
    }
}