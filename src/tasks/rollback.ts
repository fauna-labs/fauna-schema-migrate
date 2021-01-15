import { isMissingMigrationCollectionFaunaError, isSchemaCachingFaunaError } from "../errors/detect-errors";
import { createMigrationCollection, retrieveAllCloudMigrations } from "../fql/fql-snippets";
import { prettyPrintExpr } from "../fql/print";
import { transformUpdateToCreate } from "../fql/transform";
import { interactiveShell } from "../interactive-shell/interactive-shell";
import { renderMigrationState } from "../interactive-shell/messages/messages";
import { transformDiffToExpressions } from "../migrations/plan";
import { retrieveRollbackMigrations, retrieveDiff, generateRollbackQuery } from "../migrations/rollback";
import { clientGenerator } from "../util/fauna-client";

const rollback = async (amount: number | "all" = 1) => {
    try {
        let client = await clientGenerator.getClient()
        let query: any = null
        try {
            interactiveShell.startSubtask(`Retrieving current cloud migration state`)
            const cloudMigrations = (await retrieveAllCloudMigrations(client))
            const allCloudMigrations = cloudMigrations.map((e) => e.timestamp)
            // Parse parameter
            if (amount === "all") { amount = cloudMigrations.length }
            else if (typeof amount === "string") { amount = parseInt(amount) }

            const rMigs = await retrieveRollbackMigrations(cloudMigrations, amount)
            interactiveShell.addMessage(renderMigrationState(allCloudMigrations, rMigs.allLocalMigrations, "rollback", amount))
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
                const diff = await retrieveDiff(rMigs.toRollback.current, rMigs.toRollback.target)
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


export default rollback;
