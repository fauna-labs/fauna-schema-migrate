// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { TaggedExpression } from '../types/expressions'

export class EvalFqlError extends Error {
  constructor(err: Error, fql: string) {
    // Todo JSlint the fql string to get decent errors.
    const message = `
Failed to evaluate FQL expression with SyntaxError:
${err}
--------------
${fql}
--------------
        `
    super(message)
    Object.setPrototypeOf(this, EvalFqlError.prototype)
  }
}
