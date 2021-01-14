import { isSchemaCachingFaunaError } from "../errors/detect-errors";
import { prettyPrintExpr } from "../fql/print";
import { interactiveShell } from "../interactive-shell/interactive-shell";
import { renderMigrationState } from "../interactive-shell/messages/messages";
import { retrieveNextMigration, generateMigrations, verifyLastMigration } from "../migrations/advance";
import { clientGenerator } from "../util/fauna-client";

const apply = async (options: any, interactive: boolean) => {
    const client = await clientGenerator.getClient()
    let migrationFQL: any = null
    try {

        // Create configuration file
        interactiveShell.startSubtask(`Retrieving current cloud migration state`)
        const nextAndAll = await retrieveNextMigration(client)
        interactiveShell.completeSubtask(`Retrieved current migration state`)
        interactiveShell.addMessage(renderMigrationState(nextAndAll.lastCloudMigration, nextAndAll.allMigrations, 1))
        const verified = verifyLastMigration(nextAndAll.lastCloudMigration, nextAndAll.allMigrations)
        if (verified) {
            interactiveShell.startSubtask(`Generate migration code`)
            migrationFQL = await generateMigrations(nextAndAll.lastCloudMigration)
            interactiveShell.completeSubtask(`Generated migration code`)
            interactiveShell.printBoxedCode(prettyPrintExpr(migrationFQL.query))

            interactiveShell.startSubtask(`Applying migration`)
            await client.query(migrationFQL.query)
            interactiveShell.completeSubtask(`Applied migration`)
        }
        else {
            interactiveShell.completeSubtask(`Done, no migrations to apply`)
        }

    } catch (error) {
        const description = isSchemaCachingFaunaError(error)
        if (description) {
            interactiveShell.reportWarning(description)
            interactiveShell.startSubtask(`Waiting for 60 seconds for cache to clear`)
            await new Promise(resolve => setTimeout(resolve, 60000));
            interactiveShell.startSubtask(`Applying migration`)
            await client.query(migrationFQL.query)
            interactiveShell.completeSubtask(`Applied migration`)


        } else {
            interactiveShell.reportError(error)
        }
    }
};

export default apply;
