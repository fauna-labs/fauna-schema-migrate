
export const isCreateUdfExpression = (snippet: any) => {
    return isFqlExpressionOfType(snippet, 'create_function')
}

export const isCreateRoleExpression = (snippet: any) => {
    return isFqlExpressionOfType(snippet, 'create_role')
}

const isFqlExpressionOfType = (snippet: any, name: string) => {
    return Object.keys(snippet.raw).includes(name)
}

