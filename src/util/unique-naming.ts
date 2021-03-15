import { TaggedExpression } from '../types/expressions'

export const toIndexableName = (expr: TaggedExpression): string => {
  return `${expr.type}_-_${expr.name}`
}

export const toIndexableNameWithDb = (expr: TaggedExpression): string => {
  return `${expr.db.join('/')}_-_${expr.type}_-_${expr.name}`
}

export const toIndexableNameFromTypeAndName = (type: string, name: string): string => {
  return `${type}_-_${name}`
}
