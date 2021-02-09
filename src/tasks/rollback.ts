import { isMissingMigrationCollectionFaunaError, isSchemaCachingFaunaError } from "../errors/detect-errors";
import { prettyPrintExpr } from "../fql/print";
import { interactiveShell } from "../";
import { renderMigrationState } from "../interactive-shell/messages/messages";
import { transformDiffToExpressions } from "../migrations/diff";
import { retrieveRollbackMigrations, retrieveDiffCurrentTarget, generateRollbackQuery } from "../migrations/rollback";
import { createMigrationCollection, retrieveAllCloudMigrations } from "../state/from-cloud";
import { clientGenerator } from "../util/fauna-client";
import { ExpectedNumberOfMigrations } from "../errors/ExpectedNumber";

const rollback = async (amount: number | string = 1, atChildDbPath: string[] = []) => {
    validateNumber(amount)

    try {
        let client = await clientGenerator.getClient(atChildDbPath)
        let query: any = null
        try {
            interactiveShell.startSubtask(`Retrieving current cloud migration state`)
            const cloudMigrations = (await retrieveAllCloudMigrations(client))
            const allCloudMigrations = cloudMigrations.map((e) => e.timestamp)

            // Parse parameter
            if (amount === "all") { amount = cloudMigrations.length }
            else if (typeof amount === "string") { amount = parseInt(amount) }

            const rMigs = await retrieveRollbackMigrations(cloudMigrations, amount, atChildDbPath)
            interactiveShell.renderMigrations(allCloudMigrations, rMigs.allLocalMigrations, "rollback", amount)
            // Verify whether there are migrations
            if (allCloudMigrations.length === 0) {
                interactiveShell.completeSubtask(`Done, no migrations to rollback`)
            }
            // If we are using Child database, nuke the whole database.
            else if (amount >= allCloudMigrations.length && process.env.FAUNA_CHILD_DB) {
                interactiveShell.completeSubtask(`Retrieved current migration state`)
                interactiveShell.startSubtask(`Rolling back all migrations, nuking child database instead`)
                await clientGenerator.destroyChildDb()
                interactiveShell.completeSubtask(`Nuked child database`)
                interactiveShell.startSubtask(`Reinitialising datase & migrations collection`)
                client = await clientGenerator.getClient([], true)
                await createMigrationCollection(client)
                interactiveShell.completeSubtask(`Applied rollback`)
            }
            // Else, normal flow, retrieve state, calculate diff, apply
            else {
                interactiveShell.completeSubtask(`Retrieved current migration state`)
                interactiveShell.startSubtask(`Calculating diff`)
                const diff = await retrieveDiffCurrentTarget(rMigs.toRollback.current, rMigs.toRollback.target, atChildDbPath)
                const expressions = transformDiffToExpressions(diff)
                interactiveShell.completeSubtask(`Calculated diff`)

                interactiveShell.startSubtask(`Generating query`)
                query = await generateRollbackQuery(expressions, rMigs.toRollback.skipped, rMigs.toRollback.current)
                interactiveShell.completeSubtask(`Generating query`)
                interactiveShell.printBoxedCode(prettyPrintExpr(query))

                interactiveShell.startSubtask(`Applying rollback`)
                await client.query(query)
                interactiveShell.completeSubtask(`Applied rollback`)
            }
        } catch (error) {
            const missingMigrDescription = isMissingMigrationCollectionFaunaError(error)
            if (missingMigrDescription) {
                return interactiveShell.reportWarning(`The migrations collection is missing, \n did you run 'init' first?`)
            }
            const schemaDescription = isSchemaCachingFaunaError(error)
            if (schemaDescription) {
                interactiveShell.startSubtask(`${schemaDescription}\nWaiting for 60 seconds for cache to clear`)
                await new Promise(resolve => setTimeout(resolve, 60000));
                interactiveShell.startSubtask(`Applying rollback`)
                await client.query(query)
                interactiveShell.completeSubtask(`Applied rollback`)
            } else {
                interactiveShell.reportError(error)
            }
        }
    }
    catch (error) {
        interactiveShell.reportError(error)
    }
}

const validateNumber = (str: any) => {
    if (str !== "all" && isNaN(str) || isNaN(parseFloat(str))) {
        throw new ExpectedNumberOfMigrations(str)
    }
}

export default rollback;
