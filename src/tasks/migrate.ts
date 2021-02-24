var equalDeep = require('deep-equal');

import { planDatabaseMigrations, planMigrations } from "../migrations/plan"
import { writeMigrations, generateMigrations } from "../migrations/generate-migration"
import { interactiveShell } from "../interactive-shell/interactive-shell";
import { TaggedExpression } from "../types/expressions";

const migrate = async () => {
    const time = new Date().toISOString()
    const databaseDiff = await planDatabaseMigrations()
    // Migrate the root db
    const childDbExprs = findChildDatabaseExpressions([], databaseDiff)
    await migrateOneDb([], databaseDiff.length > 0, time, childDbExprs)
    // Then migrate the children
    for (let dbExpr of databaseDiff) {
        const childPath = dbExpr.db.concat([dbExpr.name])
        const childDbExprs = findChildDatabaseExpressions(childPath, databaseDiff)
        await migrateOneDb(childPath, true, time, childDbExprs)
    }

};

const migrateOneDb = async (atChildDbPath: string[], multipleDbs: boolean, time: string, dbExprs: TaggedExpression[]) => {
    let dbName = ''
    if (multipleDbs) {
        dbName = atChildDbPath.length > 0 ? `[ DB: ROOT > ${atChildDbPath.join(' > ')} ]` : '[ DB: ROOT ]'
    }

    interactiveShell.startSubtask(`${dbName} Planning Migrations`)
    const planned = await planMigrations(atChildDbPath, dbExprs)
    interactiveShell.completeSubtask(`${dbName} Planned Migrations`)

    interactiveShell.startSubtask(`${dbName} Generating Migrations`)
    let migrations = await generateMigrations(planned)
    interactiveShell.completeSubtask(`${dbName} Generated Migrations`)
    if (migrations.length === 0) {
        interactiveShell.reportWarning("There is no difference, nothing to write")
    }
    else {
        interactiveShell.renderPlan(planned)
        interactiveShell.startSubtask(`${dbName} Write migrations`)
        await writeMigrations(atChildDbPath, migrations, time)

        interactiveShell.completeSubtask(`${dbName} Written migrations`)
    }
}

// Filters arrays out that have the prefix and only have
// one element left after removing the prefix.
const findChildDatabaseExpressions = (db: string[], databaseDiff: TaggedExpression[]) => {
    const prefix = db
    return databaseDiff.filter((expr) => {
        const childPath = expr.db.concat([expr.name])
        return childPath.length == prefix.length + 1 && equalDeep(childPath.slice(0, prefix.length), prefix)
    })
}






export default migrate;
