import chalk from "chalk";
import { retrieveAllResourcePaths } from "../util/files"
import { planMigrations } from "../main/planner"
import { writeMigrations } from "../main/migrator"

const migrate = async () => {
    try {
        const planned = await planMigrations()
        console.log(planned)
        writeMigrations(planned)
    } catch (error) {
        console.log(error)
        console.error(chalk.red(`${chalk.bold("Error")}: ${error.message}`));
    }
};

export default migrate;
