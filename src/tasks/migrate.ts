// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { planDatabaseMigrations, planMigrations } from '../migrations/plan'
import { writeMigrations, generateMigrations } from '../migrations/generate-migration'
import { TaggedExpression } from '../types/expressions'
import { printMessage, printChangeTable } from '../interactive-shell/shell'


const equalDeep = require('deep-equal')

const migrate = async () => {
  const time = new Date().toISOString()
  const databaseDiff = await planDatabaseMigrations()
  // Migrate the root db
  const childDbExprs = findChildDatabaseExpressions([], databaseDiff)
  await migrateOneDb([], databaseDiff.length > 0, time, childDbExprs)
  // Then migrate the children
  for (const dbExpr of databaseDiff) {
    const childPath = dbExpr.db.concat([dbExpr.name])
    const childDbExprs = findChildDatabaseExpressions(childPath, databaseDiff)
    await migrateOneDb(childPath, true, time, childDbExprs)
  }
}

const migrateOneDb = async (
  atChildDbPath: string[],
  multipleDbs: boolean,
  time: string,
  dbExprs: TaggedExpression[]
) => {
  let dbName = ''
  if (multipleDbs) {
    dbName = atChildDbPath.length > 0 ? `[ DB: ROOT > ${atChildDbPath.join(' > ')} ]` : '[ DB: ROOT ]'
  }

  printMessage(`🧬 ${dbName} Planning Migrations`)
  const planned = await planMigrations(atChildDbPath, dbExprs)
  printMessage(`✔ ${dbName} Planned Migrations`, 'success')
  
  printMessage(`⚙️ ${dbName} Generating Migrations`)

  const migrations = await generateMigrations(planned)
  printMessage(`✔ ${dbName} Generated Migrations`, 'success')
  if (migrations.length === 0) {
    printMessage(`! There is no difference, nothing to write`, 'info')

  } else {
    printChangeTable(planned);
    await writeMigrations(atChildDbPath, migrations, time)
    printMessage(`✔ ${dbName} Written migrations`, 'success')
  }
}

// Filters arrays out that have the prefix and only have
// one element left after removing the prefix.
const findChildDatabaseExpressions = (db: string[], databaseDiff: TaggedExpression[]) => {
  const prefix = db
  return databaseDiff.filter((expr) => {
    const childPath = expr.db.concat([expr.name])
    return childPath.length === prefix.length + 1 && equalDeep(childPath.slice(0, prefix.length), prefix)
  })
}

export default migrate
