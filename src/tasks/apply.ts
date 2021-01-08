import chalk from "chalk";
import { advanceMigrations } from "../migrations/advance";

const apply = async () => {
    try {
        advanceMigrations()
    } catch (error) {
        console.log(error)
        console.error(chalk.red(`${chalk.bold("Error")}: ${error.message}`));
    }
};

export default apply;
