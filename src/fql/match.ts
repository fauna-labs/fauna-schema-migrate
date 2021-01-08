var cloneDeep = require('lodash.clonedeep')

import { TaggedExpression, StatementType } from "../types/expressions"
import { ResourceTypes, TypeResult } from "../types/resource-types"

export const addNamesAndTypes = (snippets: TaggedExpression[]) => {
    snippets.forEach((s) => {
        let res = getMatchingResult(s)
        s.type = res.type
        s.name = res.name
        s.jsonData = res.jsonData
        s.statement = res.statement
    })
}

export const retrieveReference = (snippet: TaggedExpression) => {
    return snippet.json.ref
}

const getMatchingResult = (s: TaggedExpression) => {
    let matchers = [
        isCollectionExpression,
        isIndexEpression,
        isUdfExpression,
        isRoleExpression,
        isAccessProvider
    ]
    for (let m of matchers) {
        let res = m(s)
        if (res)
            return res
    }
    throw new Error(`Unknown snippet type ${s.toString().substring(0, 50)} ... TODO, PRETTY MESSAGE OF WHAT TYPES ARE ALLOWED`)
}


// Seems to be always the same. We could simplify the code
const isAccessProvider = (snippet: TaggedExpression): TypeResult | false => {
    const resType = ResourceTypes.AccessProvider
    return isCreateFqlExpressionOfType(snippet, 'create_access_provider', resType) ||
        isDeleteFqlExpressionOfType(snippet, 'access_provider', resType) ||
        isUpdateFqlExpressionOfType(snippet, 'access_provider', resType)
}

const isCollectionExpression = (snippet: TaggedExpression): TypeResult | false => {
    const resType = ResourceTypes.Collection
    return isCreateFqlExpressionOfType(snippet, 'create_collection', resType) ||
        isDeleteFqlExpressionOfType(snippet, 'collection', resType) ||
        isUpdateFqlExpressionOfType(snippet, 'collection', resType)
}

const isIndexEpression = (snippet: TaggedExpression): TypeResult | false => {
    const resType = ResourceTypes.Index
    return isCreateFqlExpressionOfType(snippet, 'create_index', resType) ||
        isDeleteFqlExpressionOfType(snippet, 'index', resType) ||
        isUpdateFqlExpressionOfType(snippet, 'index', resType)
}


const isUdfExpression = (snippet: TaggedExpression) => {
    const resType = ResourceTypes.Function
    return isCreateFqlExpressionOfType(snippet, 'create_function', resType) ||
        isDeleteFqlExpressionOfType(snippet, 'function', resType) ||
        isUpdateFqlExpressionOfType(snippet, 'function', resType)
}

const isRoleExpression = (snippet: TaggedExpression): TypeResult | false => {
    const resType = ResourceTypes.Role
    return isCreateFqlExpressionOfType(snippet, 'create_role', resType) ||
        isDeleteFqlExpressionOfType(snippet, 'role', resType) ||
        isUpdateFqlExpressionOfType(snippet, 'role', resType)
}

const isCreateFqlExpressionOfType = (snippet: TaggedExpression, exprType: string, resType: ResourceTypes): TypeResult | false => {
    if (Object.keys(snippet.fqlExpr.raw).includes(exprType)) {
        // remove the name so it compared more easily to an Update statement.
        const name = snippet.json[exprType].object.name
        const jsonData = cloneDeep(snippet.json[exprType].object)
        delete jsonData.name
        return {
            jsonData: jsonData,
            name: name,
            type: resType,
            statement: StatementType.Create
        }
    }
    else {
        return false
    }
}

const isUpdateFqlExpressionOfType = (snippet: TaggedExpression, exprType: string, resType: ResourceTypes): TypeResult | false => {
    if (snippet.fqlExpr.raw.update && Object.keys(snippet.fqlExpr.raw.update.raw).includes(exprType)) {
        return {
            jsonData: snippet.json.params.object,
            name: snippet.json.update[exprType],
            type: resType,
            statement: StatementType.Update
        }
    }
    else {
        return false
    }
}

const isDeleteFqlExpressionOfType = (snippet: TaggedExpression, exprType: string, resType: ResourceTypes): TypeResult | false => {
    if (snippet.fqlExpr.raw.delete && Object.keys(snippet.fqlExpr.raw.delete.raw).includes(exprType)) {
        return {
            jsonData: {},
            name: snippet.json.delete[exprType],
            type: resType,
            statement: StatementType.Delete
        }
    }
    else {
        return false
    }
}
