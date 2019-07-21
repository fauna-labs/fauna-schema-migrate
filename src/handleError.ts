import chalk from "chalk";
import { MigrationError } from "..";

const handleError = (error: MigrationError) => {
  let errorMessage = error.message;

  if (error.migration) {
    errorMessage = `${error.message} in ${error.migration.label}`;
  }

  console.log(chalk.red(`${chalk.bold("Error")}: ${errorMessage}`));
  console.log(JSON.stringify(error, null, 2));
};

export default handleError;
