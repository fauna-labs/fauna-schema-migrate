
import init from "./tasks/init";
import apply from "./tasks/apply";
import migrate from "./tasks/migrate";
import run from "./tasks/run";
import state from "./tasks/state";
import { interactiveShell } from "./interactive-shell/interactive-shell";
import { endTaskLine, startCommand as completedTask } from "./interactive-shell/messages/messages";
import rollback from "./tasks/rollback";
import { deleteTempDir } from "./util/files";

export interface Task {
    name: string
    description: string
    action: any,
    options?: any,
    defaultOptions?: any[]
}

export const tasks: Task[] = [
    {
        name: "run",
        description: "Run interactively",
        action: run
    },
    {
        name: "init",
        description: "Initializing folders and config",
        action: init
    },
    {
        name: "state",
        description: "Get the current state of cloud and local migrations",
        action: state
    },
    {
        name: "generate",
        description: "Generate migration from your resources",
        action: migrate
    },
    {
        name: "rollback",
        description: "Rollback applied migrations in the database",
        action: rollback,
        options: '[amount] [childDb...]',
        defaultOptions: [1, []]
    },
    {
        name: "apply",
        description: "Apply unapplied migrations against the database",
        action: apply,
        options: '[amount] [childDb...]',
        defaultOptions: [1, []]
    }
]

export const runTaskByName = async (name: string, ...params: any[]) => {
    const tasksRes = tasks.filter((t) => t.name === name)
    if (tasksRes.length > 0) {
        const task = tasksRes[0]
        if (params.length === 0 && task.defaultOptions) {
            params = task.defaultOptions
        }
        return await runTask(task, task.name === 'run', ...params)
    }
    else {
        throw new Error(`there is no task with name ${name}`)
    }
}

export const runTask = async (task: Task, interactive: boolean = false, ...params: any[]) => {

    interactiveShell.start(interactive)
    if (task.name !== 'run' && !process.env.FAUNA_LEGACY) {
        interactiveShell.addMessage(completedTask(task))
    }

    const result = await task.action(...params)
    if (task.name !== 'run' && !process.env.FAUNA_LEGACY) {
        interactiveShell.addMessage(endTaskLine())
    }
    await deleteTempDir()

    if (!interactive) {
        interactiveShell.close()
    }
    return result
}


