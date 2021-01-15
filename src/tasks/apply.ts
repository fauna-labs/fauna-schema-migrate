import { isMissingMigrationCollectionFaunaError, isSchemaCachingFaunaError } from "../errors/detect-errors";
import { prettyPrintExpr } from "../fql/print";
import { interactiveShell } from "../interactive-shell/interactive-shell";
import { renderMigrationState } from "../interactive-shell/messages/messages";
import { retrieveMigrationInfo, getCurrentAndTargetMigration, generateApplyQuery, retrieveDiff } from "../migrations/advance";
import { transformDiffToExpressions } from "../migrations/plan";
import { clientGenerator } from "../util/fauna-client";

const apply = async (amount: number | string = 1) => {
    const client = await clientGenerator.getClient()
    try {
        let query: any = null
        try {
            // Get info on current state.
            interactiveShell.startSubtask(`Retrieving current cloud migration state`)
            const migInfo = await retrieveMigrationInfo(client)
            const allCloudMigrationTimestamps = migInfo.allCloudMigrations.map((e) => e.timestamp)
            interactiveShell.completeSubtask(`Retrieved current migration state`)
            // Parse parameter
            const maxAmount = migInfo.allLocalMigrations.length - migInfo.allCloudMigrations.length
            if (amount === "all") { amount = maxAmount }
            else if (typeof amount === "string") { amount = parseInt(amount) }
            amount = Math.min(amount, maxAmount)

            // render current state, then start executing.
            interactiveShell.addMessage(renderMigrationState(allCloudMigrationTimestamps, migInfo.allLocalMigrations, "apply", amount))
            if (migInfo.allCloudMigrations.length < migInfo.allLocalMigrations.length) {
                const currTargetSkipped = await getCurrentAndTargetMigration(migInfo.allLocalMigrations, migInfo.allCloudMigrations, amount)

                interactiveShell.startSubtask(`Generate migration code`)
                const diff = await retrieveDiff(currTargetSkipped.current, currTargetSkipped.target)
                const expressions = transformDiffToExpressions(diff)
                query = await generateApplyQuery(expressions, currTargetSkipped.skipped, currTargetSkipped.target)
                interactiveShell.completeSubtask(`Generated migration code`)
                interactiveShell.printBoxedCode(prettyPrintExpr(query))

                interactiveShell.startSubtask(`Applying migration`)
                await client.query(query)
                interactiveShell.completeSubtask(`Applied migration`)
            }
            else {
                interactiveShell.completeSubtask(`Done, no migrations to apply`)
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
                interactiveShell.startSubtask(`Applying migration`)
                await client.query(query)
                return interactiveShell.completeSubtask(`Applied migration`)
            } else {
                interactiveShell.reportError(error)
            }
        }
    }
    catch (error) {
        interactiveShell.reportError(error)
    }
}

export default apply;
