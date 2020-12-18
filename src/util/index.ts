import { TaggedExpression } from "../types/expressions"

export const toIndexableName = (expr: TaggedExpression) => {
    return `${expr.type}_-_${expr.name}`
}