import chalk from "chalk";
import * as config from '../util/config'
import * as files from "../util/files";

const init = async () => {
    try {
        await config.write()
        await files.generateDefaultDirs()

    } catch (error) {
        console.log(error)
        console.error(chalk.red(`${chalk.bold("Error")}: ${error.message}`));
    }
};

export default init;
