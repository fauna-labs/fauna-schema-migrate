import chalk from "chalk";
import { writeNewMigrationDir } from "../util/files";

// Not used atm. Might be a different modus if people
// want to write migrations by hand (in which case 'generate' is not available)
// and there is no resources folder.
const newMigration = async () => {
    try {
        await writeNewMigrationDir()
    } catch (error) {
        console.log(error)
        console.error(chalk.red(`${chalk.bold("Error")}: ${error.message}`));
    }
};

export default newMigration;
