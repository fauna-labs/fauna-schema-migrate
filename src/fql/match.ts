const cloneDeep = require('lodash.clonedeep')

import { WrongMigrationTypeError } from '../errors/WrongCreateTypeError'
import { WrongResourceTypeError } from '../errors/WrongResourceTypeError'
import { TaggedExpression, StatementType } from '../types/expressions'
import { ResourceTypes, TypeResult } from '../types/resource-types'
import { camelToSnakeCase, getJsonData } from './transform'

export const addNamesAndTypes = (snippets: TaggedExpression[]) => {
  snippets.forEach((s) => {
    const res = getMatchingResult(s)
    s.type = res.type
    s.name = res.name
    s.jsonData = res.jsonData
    s.statement = res.statement
  })
}

export const verifyCreateStatementsOnly = (snippets: TaggedExpression[]) => {
  snippets.forEach((s) => {
    const res = getMatchingResult(s)
    if (res.statement !== StatementType.Create) {
      throw new WrongResourceTypeError(s)
    }
  })
}

export const retrieveReference = (snippet: TaggedExpression) => {
  return snippet.json.ref
}

const getMatchingResult = (s: TaggedExpression) => {
  const matchers = [
    createMatcher(ResourceTypes.Collection),
    createMatcher(ResourceTypes.Index),
    createMatcher(ResourceTypes.Function),
    createMatcher(ResourceTypes.Role),
    createMatcher(ResourceTypes.AccessProvider),
    createMatcher(ResourceTypes.Database),
  ]
  for (const m of matchers) {
    const res = m(s)
    if (res) return res
  }

  throw new WrongMigrationTypeError(s)
}

// Seems to be always the same. We could simplify the code
const createMatcher = (resType: ResourceTypes): any => {
  return (snippet: TaggedExpression) => {
    return (
      isCreateFqlExpressionOfType(snippet, resType) ||
      isDeleteFqlExpressionOfType(snippet, resType) ||
      isUpdateFqlExpressionOfType(snippet, resType)
    )
  }
}

const isCreateFqlExpressionOfType = (snippet: TaggedExpression, resType: ResourceTypes): TypeResult | false => {
  const stringResType = 'create_' + camelToSnakeCase(resType)
  if (Object.keys(snippet.fqlExpr.raw).includes(stringResType)) {
    // remove the name so it compared more easily to an Update statement.
    return {
      jsonData: getJsonData(snippet.fqlExpr, resType, StatementType.Create),
      name: snippet.fqlExpr.raw[stringResType].raw.object.name,
      type: resType,
      statement: StatementType.Create,
    }
  } else {
    return false
  }
}

const isUpdateFqlExpressionOfType = (snippet: TaggedExpression, resType: ResourceTypes): TypeResult | false => {
  const stringResType = camelToSnakeCase(resType)
  if (snippet.fqlExpr.raw.update && Object.keys(snippet.fqlExpr.raw.update.raw).includes(stringResType)) {
    return {
      jsonData: getJsonData(snippet.fqlExpr, resType, StatementType.Update),
      name: snippet.fqlExpr.raw.update.raw[stringResType],
      type: resType,
      statement: StatementType.Update,
    }
  } else {
    return false
  }
}

const isDeleteFqlExpressionOfType = (snippet: TaggedExpression, resType: ResourceTypes): TypeResult | false => {
  const stringResType = camelToSnakeCase(resType)

  if (snippet.fqlExpr.raw.delete && Object.keys(snippet.fqlExpr.raw.delete.raw).includes(stringResType)) {
    return {
      jsonData: {},
      name: snippet.fqlExpr.raw.delete.raw[stringResType],
      type: resType,
      statement: StatementType.Delete,
    }
  } else {
    return false
  }
}
