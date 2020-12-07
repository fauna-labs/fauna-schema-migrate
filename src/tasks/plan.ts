import chalk from "chalk";
import { loadResourceFiles } from "../util/files"
import { planMigrations } from "../main/planner"
const plan = async () => {
    try {
        const resources = await loadResourceFiles()
        planMigrations(resources)
    } catch (error) {
        console.log(error)
        console.error(chalk.red(`${chalk.bold("Error")}: ${error.message}`));
    }
};

export default plan;
