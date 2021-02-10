import { isMissingMigrationCollectionFaunaError, isSchemaCachingFaunaError } from "../errors/detect-errors";
import { interactiveShell } from "../interactive-shell/interactive-shell";
import { renderMigrationState } from "../interactive-shell/messages/messages";
import { retrieveMigrationInfo } from "../migrations/advance";
import { clientGenerator } from "../util/fauna-client";

const apply = async () => {
    try {
        const client = await clientGenerator.getClient()
        interactiveShell.startSubtask(`Retrieving current cloud migration state`)
        const migInfo = await retrieveMigrationInfo(client)
        const allCloudMigrationTimestamps = migInfo.allCloudMigrations.map((e) => e.timestamp)
        interactiveShell.completeSubtask(`Retrieved current migration state`)
        interactiveShell.renderMigrations(
            allCloudMigrationTimestamps, migInfo.allLocalMigrations, "state", 0)

    } catch (error) {
        const missingMigrDescription = isMissingMigrationCollectionFaunaError(error)
        if (missingMigrDescription) {
            return interactiveShell.reportWarning(`The migrations collection is missing, \n did you run 'init' first?`)
        }
        else {
            interactiveShell.reportError(error)
        }
    }
};

export default apply;
