
import chalk from "chalk";
import { config } from '../util/config'
import * as files from "../util/files";
import { clientGenerator } from "../util/fauna-client"
import { createMigrationCollection } from "../fql/fql-snippets";
import { interactiveShell } from "../interactive-shell/interactive-shell";

const init = async () => {
    try {

        // Create configuration file
        interactiveShell.start()
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

        // Create migrations collection
        const collectionName = await config.getMigrationCollection()
        interactiveShell.startSubtask(`Creating collection ${collectionName} to store migrations in your fauna database`)
        const client = await clientGenerator.getClient()
        const result = await createMigrationCollection(client)
        if (result) {
            interactiveShell.completeSubtask(`Created collection ${collectionName} to store migrations in your fauna database`)
        }
        else {
            interactiveShell.completeSubtask(`Nothing to do, Collection ${collectionName} already exists`)
        }
    } catch (error) {
        interactiveShell.reportError(error)
    }
};

export default init;
