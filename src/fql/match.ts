var cloneDeep = require('lodash.clonedeep')

import { WrongCreateTypeError } from "../errors/WrongCreateTypeError"
import { TaggedExpression, StatementType } from "../types/expressions"
import { ResourceTypes, TypeResult } from "../types/resource-types"
import { camelToSnakeCase, getJsonData } from "./transform"

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
        createMatcher(ResourceTypes.Collection),
        createMatcher(ResourceTypes.Index),
        createMatcher(ResourceTypes.Function),
        createMatcher(ResourceTypes.Role),
        createMatcher(ResourceTypes.AccessProvider),
        createMatcher(ResourceTypes.Database)
    ]
    for (let m of matchers) {
        let res = m(s)
        if (res)
            return res
    }

    throw new WrongCreateTypeError(s)
}


// Seems to be always the same. We could simplify the code
const createMatcher = (resType: ResourceTypes): any => {
    return (snippet: TaggedExpression,) => {
        return isCreateFqlExpressionOfType(snippet, resType) ||
            isDeleteFqlExpressionOfType(snippet, resType) ||
            isUpdateFqlExpressionOfType(snippet, resType)
    }
}

const isCreateFqlExpressionOfType = (snippet: TaggedExpression, resType: ResourceTypes): TypeResult | false => {
    const stringResType = 'create_' + camelToSnakeCase(resType)
    if (Object.keys(snippet.fqlExpr.raw).includes(stringResType)) {
        // remove the name so it compared more easily to an Update statement.
        return {
            jsonData: getJsonData(snippet.json, resType, StatementType.Create),
            name: snippet.json[stringResType].object.name,
            type: resType,
            statement: StatementType.Create
        }
    }
    else {
        return false
    }
}

const isUpdateFqlExpressionOfType = (snippet: TaggedExpression, resType: ResourceTypes): TypeResult | false => {
    const stringResType = camelToSnakeCase(resType)

    if (snippet.fqlExpr.raw.update && Object.keys(snippet.fqlExpr.raw.update.raw).includes(stringResType)) {
        return {
            jsonData: getJsonData(snippet.json, resType, StatementType.Update),
            name: snippet.json.update[stringResType],
            type: resType,
            statement: StatementType.Update
        }
    }
    else {
        return false
    }
}

const isDeleteFqlExpressionOfType = (snippet: TaggedExpression, resType: ResourceTypes): TypeResult | false => {
    const stringResType = camelToSnakeCase(resType)

    if (snippet.fqlExpr.raw.delete && Object.keys(snippet.fqlExpr.raw.delete.raw).includes(stringResType)) {
        return {
            jsonData: {},
            name: snippet.json.delete[stringResType],
            type: resType,
            statement: StatementType.Delete
        }
    }
    else {
        return false
    }
}
