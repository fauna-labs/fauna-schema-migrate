
import init from "./init";
import plan from "./plan";
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
        name: "plan",
        description: "Planning",
        action: plan
        // options? ....
    },
    {
        name: "migrate",
        description: "Migrating",
        action: migrate
        // options? ....
    },
    {
        name: "validate",
        description: "Validating",
        action: validate
        // options? ....
    },
    {
        name: "apply",
        description: "Applying",
        action: apply
        // options? ....
    }
]
