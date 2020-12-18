
import init from "./init";
import newMigration from "./new";
import apply from "./apply";
import migrate from "./migrate";
import validate from "./validate";

export default [
    {
        name: "init",
        description: "Initializing folders and config",
        action: init
        // options? ....
    },
    {
        name: "new",
        description: "Create a new migration",
        action: newMigration
        // options? ....
    },
    {
        name: "migrate",
        description: "Generate migrations from your resources",
        action: migrate
        // options? ....
    },
    {
        name: "validate",
        description: "TODO: validate whether migrations are compatible with database.",
        action: validate
        // options? ....
    },
    {
        name: "apply",
        description: "Apply the new migrations against the database",
        action: apply
        // options? ....
    }
]
