
import rollback from "./old_rollback";
import init from "./init";
import plan from "./plan";
import apply from "./apply";

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
        name: "apply",
        description: "Applying",
        action: apply
        // options? ....
    }
]
