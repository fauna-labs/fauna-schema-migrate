import chalk from "chalk";
import { isSchemaCachingFaunaError } from "../errors/detect-errors";
import { prettyPrintExpr } from "../fql/print";
import { interactiveShell } from "../interactive-shell/interactive-shell";
import { renderMigrationState } from "../interactive-shell/messages/messages";
import { retrieveRollbackMigrations, retrieveDiff, transformDiffToExpressions, generateRollbackQuery } from "../migrations/rollback";
import { clientGenerator } from "../util/fauna-client";

const rollback = async (options: any) => {
    const client = await clientGenerator.getClient()
    try {
        const amount = options ? options.amount : 1
        interactiveShell.startSubtask(`Retrieving current cloud migration state`)
        const rMigs = await retrieveRollbackMigrations(client, amount)
        interactiveShell.completeSubtask(`Retrieved current migration state`)
        interactiveShell.addMessage(renderMigrationState(rMigs.toRollback.current.timestamp, rMigs.allMigrations, -1))

        interactiveShell.startSubtask(`Calculating diff`)
        const diff = await retrieveDiff(rMigs.toRollback.current, rMigs.toRollback.target)
        const expressions = transformDiffToExpressions(diff)
        interactiveShell.completeSubtask(`Calculated diff`)

        interactiveShell.startSubtask(`Generating query`)
        const query = await generateRollbackQuery(expressions, rMigs.toRollback.skipped, rMigs.toRollback.current)
        interactiveShell.completeSubtask(`Generating query`)
        interactiveShell.printBoxedCode(prettyPrintExpr(query))

        interactiveShell.startSubtask(`Applying rollback`)
        await client.query(query)
        interactiveShell.completeSubtask(`Applied rollback`)

    } catch (error) {
        const description = isSchemaCachingFaunaError(error)
        if (description) {
            interactiveShell.reportWarning(description)
            interactiveShell.startSubtask(`Waiting for 60 seconds for cache to clear`)
            await new Promise(resolve => setTimeout(resolve, 60000));
            await rollback(options)
        } else {
            interactiveShell.reportError(error)
        }
    }
};

export default rollback;
