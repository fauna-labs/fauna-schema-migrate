import { TaggedExpression } from '../types/expressions'

export class ExpectedNumberOfMigrations extends Error {
  constructor(m: string) {
    const message = `Expected parameter of type number or the string "all" for the amount of migrations to apply/rollback, received ${m}`
    super(message)

    Object.setPrototypeOf(this, ExpectedNumberOfMigrations.prototype)
  }
}
