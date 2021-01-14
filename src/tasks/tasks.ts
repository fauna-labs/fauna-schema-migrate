
import init from "./init";
import newMigration from "./new";
import apply from "./apply";
import migrate from "./migrate";
import run from "./run";
import { interactiveShell } from "../interactive-shell/interactive-shell";
import { endTaskLine, startCommand as completedTask } from "../interactive-shell/messages/messages";
import rollback from "./rollback";

export interface Task {
    name: string
    description: string
    action: any,
    defaultOptions?: any
}

export const tasks: Task[] = [
    {
        name: "run",
        description: "Run interactively",
        action: run
    },
    {
        name: "init",
        description: "Initializing folders, config and migration collection",
        action: init
    },
    // {
    //     name: "new-migration",
    //     description: "Create a new migration",
    //     action: newMigration
    // },
    {
        name: "generate",
        description: "Generate migration from your resources",
        action: migrate
    },
    {
        name: "rollback",
        description: "Rollback applied migrations in the database",
        action: rollback,
        // todo implement options
        defaultOptions: { amount: 1 }
    },
    // {
    //     name: "validate",
    //     description: "TODO: validate whether migrations are compatible with database.",
    //     action: validate
    //     // options? ....
    // },
    {
        name: "apply",
        description: "Apply unapplied migrations against the database",
        action: apply,
        // todo implement options
        defaultOptions: { amount: 1 }
    }
]

export const runTaskByName = async (name: string, options: any) => {
    const task = tasks.filter((t) => t.name === name)
    if (task.length > 0) {
        return await runTask(task[0], task[0].name === 'run', options)
    }
    else {
        throw new Error(`there is no task with name ${name}`)
    }
}

export const runTask = async (task: Task, interactive: boolean = false, options?: any) => {
    interactiveShell.start(interactive)
    if (task.name !== 'run') {
        interactiveShell.addMessage(completedTask(task))
    }
    const result = await task.action(options || task.defaultOptions, interactive)
    if (task.name !== 'run') {
        interactiveShell.addMessage(endTaskLine())
    }
    if (!interactive) {
        interactiveShell.close()
    }

    return result
}


