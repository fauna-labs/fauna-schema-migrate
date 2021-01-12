import chalk from "chalk";
import { interactiveShell } from "../interactive-shell/interactive-shell";
const run = async () => {
    try {
        await interactiveShell.start()
    } catch (error) {
        console.log(error)
        console.error(chalk.red(`${chalk.bold("Error")}: ${error.message}`));
    }
};

export default run;
