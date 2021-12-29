// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { isMissingMigrationCollectionFaunaError, isSchemaCachingFaunaError } from '../errors/detect-errors'
import { prettyPrintExpr } from '../fql/print'
import { printWithMargin } from '../interactive-shell/interactive-shell'
import { transformDiffToExpressions } from '../migrations/diff'
import { retrieveRollbackMigrations, retrieveDiffCurrentTarget, generateRollbackQuery } from '../migrations/rollback'
import { createMigrationCollection, retrieveAllCloudMigrations } from '../state/from-cloud'
import { clientGenerator } from '../util/fauna-client'
import { ExpectedNumberOfMigrations } from '../errors/ExpectedNumber'
import { printMessage, renderMigrations } from '../interactive-shell/shell'
import { config } from '../util/config'

const rollback = async (amount: number | string = 1, atChildDbPath: string[] = []) => {
  validateNumber(amount)

  let client = await clientGenerator.getClient(atChildDbPath)
  let query: any = null
  try {
    printMessage(`Retrieving current cloud migration state`)
    const cloudMigrations = await retrieveAllCloudMigrations(client)
    const allCloudMigrations = cloudMigrations.map((e) => e.timestamp)

    // Parse parameter
    if (amount === 'all') {
      amount = cloudMigrations.length
    } else if (typeof amount === 'string') {
      amount = parseInt(amount)
    }

    const rMigs = await retrieveRollbackMigrations(cloudMigrations, amount, atChildDbPath)
    renderMigrations(allCloudMigrations, rMigs.allLocalMigrations, 'rollback', amount)
    // Verify whether there are migrations
    if (allCloudMigrations.length === 0) {
      printMessage(`✅ Done, no migrations to rollback`)
    }
    // If we are using Child database, nuke the whole database.
    else if (amount >= allCloudMigrations.length && process.env.FAUNA_CHILD_DB) {
      printMessage(`Retrieved current migration state`, 'success')
      printMessage(`Rolling back all migrations, nuking child database instead`, 'success')
      await clientGenerator.destroyChildDb()
      printMessage(`Nuked child database`, 'success')
      printMessage(`Reinitialising datase & migrations collection`, 'info')
      client = await clientGenerator.getClient([], true)
      await createMigrationCollection(client)
      printMessage(`Applied rollback`, 'success')
    }
    // Else, normal flow, retrieve state, calculate diff, apply
    else {
      printMessage(`Retrieved current migration state`, 'info')
      printMessage(`Calculating diff`)
      const diff = await retrieveDiffCurrentTarget(rMigs.toRollback.current, rMigs.toRollback.target, atChildDbPath)
      const expressions = transformDiffToExpressions(diff)
      printMessage(`Calculated diff`)

      printMessage(`Generating query`)
      const migrCollection = await config.getMigrationCollection()
      query = await generateRollbackQuery(
        expressions,
        rMigs.toRollback.skipped.map((e) => e.timestamp),
        rMigs.toRollback.current.timestamp,
        migrCollection
      )
      printMessage(`Generating query`)
      printWithMargin(prettyPrintExpr(query), 8)

      printMessage(`Applying rollback`)
      await client.query(query)
      printMessage(`Applied rollback`, 'success')
    }
  } catch (error) {
    const missingMigrDescription = isMissingMigrationCollectionFaunaError(error)
    if (missingMigrDescription) {
      printMessage(`The migrations collection is missing, \n did you run 'init' first?`, 'error')
      return
    }
    const schemaDescription = isSchemaCachingFaunaError(error)
    if (schemaDescription) {
      printMessage(`${schemaDescription}\nWaiting for 60 seconds for cache to clear`)
      await new Promise((resolve) => setTimeout(resolve, 60000))
      printMessage(`Applying rollback`, 'success')
      await client.query(query)
      printMessage(`Applied rollback`, 'success')
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

export default rollback
