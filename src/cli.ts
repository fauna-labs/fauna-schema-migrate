#!/usr/bin/env node

// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { printMessage, printHeader } from './interactive-shell/shell'
import program from 'commander'
import { ErrorWithFilePath } from './errors/ErrorWithFilePath'
import { tasks, runTask } from './tasks'
import boxen from 'boxen'
import { bold } from 'kleur'

// Global configuration of the CLI
program
  .description('Fauna schema migrations')
  .option(
    '-l --legacy',
    'set this option or the FAUNA_LEGACY environment var to disable fancy output for legacy terminals or allow easy copying of text'
  )
  .option(
    '-n --no-print',
    'set this option or the FAUNA_NOPRINT to omit printing of the FQL transactions which could be big'
  )
  .option(
    '-c --child-db <name>',
    'set this option or the FAUNA_CHILD_DB environment var to run the schema migrations in a child db which allows for faster recreation, avoiding the 60s schema cache'
  )
  .option(
    '-k --key <key>',
    'set this option or the FAUNA_ADMIN_KEY environment to pass the fauna admin secret, be careful that your keys do not end up in server/CI logs, use FAUNA_ADMIN_KEY if you are not sure!'
  )
  .parse(process.argv)

// Configure all tasks to directly work with commander
const options = program.opts()
if (options.key) process.env.FAUNA_ADMIN_KEY = options.key
if (options.childDb) process.env.FAUNA_CHILD_DB = options.childDb
if (options.legacy) process.env.FAUNA_LEGACY = options.legacy
if (options.noPrint) process.env.FAUNA_NOPRINT = options.noPrint

const actionErrorHandler = (error: Error) => {
  if (error instanceof ErrorWithFilePath) {
    console.error('\nError in file: ' + error.filePath)
  }
  console.error(
    error.message
      .split('\n')
      .map((e) => ' '.repeat(2) + e)
      .join('\n')
  )
  console.error('Stacktrace ' + error.stack)
  process.exitCode = 1
  process.exit()
}

tasks.forEach((task) => {
  program
    .command(`${task.name}${task.options ? ' ' + task.options : ''}`)
    .description(task.description)
    .action(async (...params) => {
      try {
        await runTask(task, task.name === 'run', ...params)
      } catch (err) {
        actionErrorHandler(err as Error)
      }
    })
})

// On unknown command, show the user some help
program.on('command:*', function (operands) {
  printHeader()
  printMessage(`! Unknown command '${operands[0]}'`, "info")
  console.log(boxen(program.helpInformation(), {
    title: bold().red().bgCyan('Help Menu'), 
    titleAlignment: 'center',
    padding: 1,
    borderColor: 'cyan'
  }));
  process.exitCode = 1
})

if (process.argv.length === 2) {
  console.info(program.helpInformation())
  process.exitCode = 1
} else {
  program.parse(process.argv)
}

export { program }