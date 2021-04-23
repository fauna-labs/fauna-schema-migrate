// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

export { getSnippetsFromStrings, getSnippetsFromCode, getSnippetsFromPaths } from './state/from-code'
export { diffSnippets } from './migrations/diff'
export { generateMigrations } from './migrations/generate-migration'
export { generateMigrationLetObject } from './migrations/generate-query'
export { generateApplyQuery } from './migrations/advance'
export { generateRollbackQuery } from './migrations/rollback'
