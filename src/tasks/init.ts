
import { config } from '../util/config'
import * as files from "../util/files";
import { clientGenerator } from "../util/fauna-client"
import { interactiveShell } from "../interactive-shell/interactive-shell";
import { createMigrationCollection } from '../state/from-cloud';

const init = async () => {
    try {
        // Create configuration file
        interactiveShell.startSubtask(`Writing configuration file}`)
        const fullPath = await config.writeConfig()
        if (fullPath) {
            interactiveShell.completeSubtask(`Wrote configuration file ${fullPath}`)
        }
        else {
            interactiveShell.completeSubtask(`Nothing to do, file exists`)
        }

        // Create directories
        interactiveShell.startSubtask(`Generating default directories`)
        await files.generateDefaultDirs()
        interactiveShell.completeSubtask(`Generated default directories`)

    } catch (error) {
        interactiveShell.reportError(error)
    }
};

export default init;
