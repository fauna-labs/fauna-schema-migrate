import { TaggedExpression } from "../types/expressions"
import { ResourceTypes } from "../types/resource-types"

export const toIndexableName = (expr: TaggedExpression) => {
    return `${expr.type}_-_${expr.name}`
}

export const toIndexableNameWithDb = (expr: TaggedExpression) => {
    return `${expr.db.join("/")}_-_${expr.type}_-_${expr.name}`
}

export const toIndexableNameFromTypeAndName = (type: string, name: string) => {
    return `${type}_-_${name}`
}