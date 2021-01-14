import chalk from "chalk";
import { planMigrations } from "../migrations/plan"
import { writeMigrations, generateMigrations } from "../migrations/generate-migration"

const migrate = async () => {
    try {
        const planned = await planMigrations()
        const migrations = await generateMigrations(planned)
        await writeMigrations(migrations)
    } catch (error) {
        console.log(error)
        console.error(chalk.red(`${chalk.bold("Error")}: ${error.message}`));
    }
};

export default migrate;
