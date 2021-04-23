// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { TaggedExpression } from '../types/expressions'

export class ErrorWithFilePath extends Error {
  filePath: string

  constructor(m: Error, filePath: string) {
    super(m.message)
    this.stack = new Error().stack
    this.filePath = filePath
    Object.setPrototypeOf(this, ErrorWithFilePath.prototype)
  }
}
