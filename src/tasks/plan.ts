import chalk from "chalk";
import { planMigrations } from "../main/planner"
const plan = async () => {
    try {
        const planned = await planMigrations()
        console.log(planned)
    } catch (error) {
        console.log(error)
        console.error(chalk.red(`${chalk.bold("Error")}: ${error.message}`));
    }
};

export default plan;
