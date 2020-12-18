import chalk from "chalk";
import { applyMigrations } from "../main/applier";

const apply = async () => {
    try {
        applyMigrations()
    } catch (error) {
        console.log(error)
        console.error(chalk.red(`${chalk.bold("Error")}: ${error.message}`));
    }
};

export default apply;
