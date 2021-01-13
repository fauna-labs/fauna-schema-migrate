#!/usr/bin/env node

import program from "commander";
import { tasks, runTask } from './tasks/tasks'
program.version("0.0.1").description("Fauna schema tool")

// Configure all tasks to directly work with commander
tasks.forEach((task) => {
  program
    .command(task.name)
    .description(task.description)
    .action(() => runTask(task))
})

// On unknown command, show the user some help
program.on('command:*', function (operands) {
  console.error(`error: unknown command '${operands[0]}, todo, prettify this'`)
  const availableCommands = program.commands.map((cmd: any) => cmd.name())
  console.log(operands[0], availableCommands)
  console.log(program.helpInformation());
  process.exitCode = 1
});

if (process.argv.length == 2) {
  console.log('todo helpful interactive mode')
  console.log(program.helpInformation());
  process.exitCode = 1
}
else {
  program.parse(process.argv);
}

// And also configure tasks to work interactively