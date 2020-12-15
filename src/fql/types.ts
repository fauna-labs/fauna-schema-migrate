var cloneDeep = require('lodash.clonedeep')

import { TaggedExpression, StatementType } from "../types/expressions"
import { ResourceTypes, TypeResult } from "../types/resource-types"

export const addNamesAndTypes = (snippets: TaggedExpression[]) => {
    snippets.forEach((s) => {
        // console.log('testing snippet', s)
        let res = getMatchingResult(s)
        console.log('result snippet', res)
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
        isUdfExpression,
        isRoleExpression
    ]
    for (let m of matchers) {
        let res = m(s)
        if (res)
            return res
    }
    console.log(s)
    throw new Error(`Unknown snippet type ${s.toString().substring(0, 50)} ...`)
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
