import { prettyPrintExpr } from '../fql/print'
import { TaggedExpression } from '../types/expressions'
import { ResourceTypes } from '../types/resource-types'

export class WrongMigrationTypeError extends Error {
  constructor(expr: TaggedExpression) {
    const message = `
        Only CREATE statements that start with the functions:
          ${listCreateResourceTypes().join('\n          ')}
        are allowed in the MIGRATIONS folder.
        
        Received Statement
        --------------
        ${prettyPrintExpr(expr.fqlExpr)}
        --------------
        `

    super(message)

    Object.setPrototypeOf(this, WrongMigrationTypeError.prototype)
  }
}

const listCreateResourceTypes = () => {
  const res: string[] = []
  res.push('Update')
  res.push('Delete')
  for (const r in ResourceTypes) {
    res.push('Create' + r)
  }
  return res
}
