// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { TaggedExpression } from './expressions'

export interface MigrationPathAndFiles {
  migration: string
  files: string[]
  expressions?: TaggedExpression[]
}

export interface MigrationPathAndExpressions {
  migration: string
  files: string[]
  expressions: TaggedExpression[]
}
