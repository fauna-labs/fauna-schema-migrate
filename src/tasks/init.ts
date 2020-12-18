
import chalk from "chalk";
import { config } from '../util/config'
import * as files from "../util/files";
import { clientGenerator } from "../util/fauna-client"
import { createMigrationCollection } from "../fql/snippets";

const init = async () => {
    try {
        await config.writeConfig()
        await files.generateDefaultDirs()
        const client = clientGenerator.getClient()
        await createMigrationCollection(client)
    } catch (error) {
        console.log(error)
        console.error(chalk.red(`${chalk.bold("Error")}: ${error.message}`));
    }
};

export default init;
