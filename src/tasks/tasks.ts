
import init from "./init";
import newMigration from "./new";
import apply from "./apply";
import migrate from "./migrate";
import validate from "./validate";
import run from "./run";

export default [
    {
        name: "run",
        description: "Run interactively",
        action: run
        // options? ....
    },
    {
        name: "init",
        description: "Initializing folders and config",
        action: init
        // options? ....
    },
    {
        name: "new-migration",
        description: "Create a new migration",
        action: newMigration
        // options? ....
    },
    {
        name: "generate-migration",
        description: "Generate migrations from your resources",
        action: migrate
        // options? ....
    },
    // {
    //     name: "validate",
    //     description: "TODO: validate whether migrations are compatible with database.",
    //     action: validate
    //     // options? ....
    // },
    {
        name: "apply",
        description: "Apply all unapplied migrations against the database",
        action: apply
        // options? ....
    }
]
