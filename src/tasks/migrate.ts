import chalk from "chalk";
import { loadResourceFiles } from "../util/files"
import { planMigrations } from "../main/planner"
import { writeMigrations } from "../main/migrator"

const migrate = async () => {
    try {
        const resources = await loadResourceFiles()
        const planned = await planMigrations(resources)
        console.log(planned)
        writeMigrations(planned)
    } catch (error) {
        console.log(error)
        console.error(chalk.red(`${chalk.bold("Error")}: ${error.message}`));
    }
};

export default migrate;
