import { TaggedExpression } from "../types/expressions"

export const isCreateUdfExpression = (snippet: TaggedExpression) => {
    return isFqlExpressionOfType(snippet, 'create_function')
}

export const isCreateRoleExpression = (snippet: TaggedExpression) => {
    return isFqlExpressionOfType(snippet, 'create_role')
}

const isFqlExpressionOfType = (snippet: TaggedExpression, name: string) => {
    return Object.keys(snippet.fqlExpr.raw).includes(name)
}

