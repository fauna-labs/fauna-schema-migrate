// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { TaggedExpression } from '../types/expressions'

export class DeletedReferenceError extends Error {
  constructor(teReferenced: TaggedExpression, te: TaggedExpression) {
    const message = `
The following resource was deleted
    type: ${teReferenced.type}, name: ${teReferenced.name}
yet was referenced from:
    type: ${te.type}, name: ${te.name}
        `
    super(message)

    Object.setPrototypeOf(this, DeletedReferenceError.prototype)
  }
}
