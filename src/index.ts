#!/usr/bin/env node

import program from "commander";
import { interactiveShell } from "./interactive-shell/interactive-shell";
import { notifyBoxedInfo } from "./interactive-shell/messages/messages";
import { tasks, runTask } from './tasks'

// Global configuration of the CLI
program
  .description("Fauna schema migrations")
  .option('-l --legacy',
    'disable fancy output for legacy terminals',
    process.env.FAUNA_LEGACY)
  .option('-c --child-db',
    'run the schema migrations in a child db which allows for faster recreation, avoiding the 60s schema cache',
    process.env.FAUNA_CHILD_DB)

// Some might desires the below option. didn't add it since this is probably
// bad practice, the key might end up in the logs.
// .option('-k --key',
//   'pass the fauna admin secret, careful for logging, use FAUNA_ADMIN_KEY if you are not sure!',
//   process.env.FAUNA_ADMIN_KEY)

// Configure all tasks to directly work with commander
tasks.forEach((task) => {
  program
    .command(`${task.name}${task.options ? ' ' + task.options : ''}`)
    .description(task.description)
    .action((...params) => runTask(task, task.name === 'run', ...params))
})

// On unknown command, show the user some help
program.on('command:*', function (operands) {
  interactiveShell.start(false)
  interactiveShell.reportWarning(`Unknown command '${operands[0]}'`)
  interactiveShell.addMessage(notifyBoxedInfo(program.helpInformation()))
  interactiveShell.close()
  process.exitCode = 1
});

if (process.argv.length == 2) {
  console.log(program.helpInformation());
  process.exitCode = 1
}
else {
  program.parse(process.argv);
}

export default program

// And also configure tasks to work interactively