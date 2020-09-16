import fs from "fs";
import { Migration, MigrationConfig } from "./types";

const getLocalMigrations = (migrationFolder: string): Migration[] => {
  const filenames: string[] = fs.readdirSync(migrationFolder).sort();
  const migrations: Migration[] = filenames.map(
    (filename: string): Migration => {
      const modulePath = `${process.cwd()}/${migrationFolder}/${filename}`;
      const migrationModule: MigrationConfig = require(modulePath);
      return {
        ...migrationModule,
        label: filename
      };
    }
  );

  return migrations;
};

export default getLocalMigrations;
