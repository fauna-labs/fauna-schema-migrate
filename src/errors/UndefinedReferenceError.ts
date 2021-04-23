// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { ReferencedResource } from '../types/expressions'

export class UndefinedReferenceError extends Error {
  constructor(te: ReferencedResource) {
    const message = `
The following resource is not defined anywhere in the resource folders
    type: ${te.type}, name: ${te.name}
and was referenced from:
    type: ${te.resource.type}, name: ${te.resource.name}

todo: add a boolean to bypass this error in case users
      want to reference resources that were defined manually.
        `
    super(message)

    Object.setPrototypeOf(this, UndefinedReferenceError.prototype)
  }
}
