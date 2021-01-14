import chalk from "chalk";
import { writeNewMigrationDir } from "../util/files";

// Not used atm.
const newMigration = async () => {
    try {
        await writeNewMigrationDir()
    } catch (error) {
        console.log(error)
        console.error(chalk.red(`${chalk.bold("Error")}: ${error.message}`));
    }
};

export default newMigration;
