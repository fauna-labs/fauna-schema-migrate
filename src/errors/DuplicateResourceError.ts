// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { TaggedExpression } from '../types/expressions'

export class DuplicateResourceError extends Error {
  constructor(m: TaggedExpression) {
    const message = `A duplicate resource exists with the type ${m.type}("${m.name}")`
    super(message)

    Object.setPrototypeOf(this, DuplicateResourceError.prototype)
  }
}
