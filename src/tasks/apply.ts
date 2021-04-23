// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { isMissingMigrationCollectionFaunaError, isSchemaCachingFaunaError } from '../errors/detect-errors'
import { prettyPrintExpr } from '../fql/print'
import { interactiveShell } from './../interactive-shell/interactive-shell'
import {
  retrieveMigrationInfo,
  getCurrentAndTargetMigration,
  generateApplyQuery,
  retrieveDiffCurrentTarget,
  retrieveDatabaseMigrationInfo,
} from '../migrations/advance'
import { transformDiffToExpressions } from '../migrations/diff'
import { clientGenerator } from '../util/fauna-client'
import { ExpectedNumberOfMigrations } from '../errors/ExpectedNumber'
import { config } from '../util/config'

const apply = async (amount: number | string = 1, atChildDbPath: string[] = []) => {
  validateNumber(amount)

  let query: any = null
  const client = await clientGenerator.getClient(atChildDbPath)

  try {
    const migInfo = await retrieveMigrationInfo(client, atChildDbPath)

    // Parse parameter
    const maxAmount = migInfo.allLocalMigrations.length - migInfo.allCloudMigrations.length
    if (amount === 'all') {
      amount = maxAmount
    } else if (typeof amount === 'string') {
      amount = parseInt(amount)
    }
    amount = Math.min(amount, maxAmount)

    // Get info on current state.
    interactiveShell.startSubtask(`Retrieving current cloud migration state`)
    const allCloudMigrationTimestamps = migInfo.allCloudMigrations.map((e) => e.timestamp)
    interactiveShell.completeSubtask(`Retrieved current migration state`)

    if (migInfo.allCloudMigrations.length < migInfo.allLocalMigrations.length) {
      const currTargetSkipped = await getCurrentAndTargetMigration(
        migInfo.allLocalMigrations,
        migInfo.allCloudMigrations,
        amount
      )
      const databaseDiff = await retrieveDatabaseMigrationInfo(currTargetSkipped.current, currTargetSkipped.target)
      const dbName = atChildDbPath.length > 0 ? `[ DB: ROOT > ${atChildDbPath.join(' > ')} ]` : '[ DB: ROOT ]'
      interactiveShell.renderMigrations(allCloudMigrationTimestamps, migInfo.allLocalMigrations, 'apply', amount)

      interactiveShell.startSubtask(`${dbName} Generate migration code`)
      const diff = await retrieveDiffCurrentTarget(atChildDbPath, currTargetSkipped.current, currTargetSkipped.target)

      const expressions = transformDiffToExpressions(diff)
      const migrCollection = await config.getMigrationCollection()
      query = await generateApplyQuery(expressions, currTargetSkipped.skipped, currTargetSkipped.target, migrCollection)
      interactiveShell.completeSubtask(`${dbName} Generated migration code`)
      interactiveShell.printBoxedCode(prettyPrintExpr(query))

      interactiveShell.startSubtask(`${dbName} Applying migration`)
      await client.query(query)
      interactiveShell.completeSubtask(`Done applying migrations`)
    } else {
      interactiveShell.completeSubtask(`Done, no migrations to apply`)
    }
  } catch (error) {
    const missingMigrDescription = isMissingMigrationCollectionFaunaError(error)
    if (missingMigrDescription) {
      return interactiveShell.reportWarning(`The migrations collection is missing, \n did you run 'init' first?`)
    }
    const schemaDescription = isSchemaCachingFaunaError(error)
    if (schemaDescription) {
      const dbName = atChildDbPath.length > 0 ? `[ DB: ROOT > ${atChildDbPath.join(' > ')} ]` : '[ DB: ROOT ]'
      interactiveShell.startSubtask(`${dbName} ${schemaDescription}\nWaiting for 60 seconds for cache to clear`)
      await new Promise((resolve) => setTimeout(resolve, 60000))
      interactiveShell.startSubtask(`${dbName} Applying migration`)
      await client.query(query)
      return interactiveShell.completeSubtask(`Applied migration`)
    } else {
      throw error
    }
  }
}

const validateNumber = (str: any) => {
  if (str !== 'all' && (isNaN(str) || isNaN(parseFloat(str)))) {
    throw new ExpectedNumberOfMigrations(str)
  }
}

export default apply
