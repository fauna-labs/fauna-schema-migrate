import { MigrationError } from "..";

const handleError = (error: MigrationError) => {
  if (!error.migration) {
    console.error(`Error: ${error.message}`);
    return;
  }
  console.error(`Error: ${error.message} in ${error.migration.label}`);
};

export default handleError;
