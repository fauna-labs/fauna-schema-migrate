// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

const prompts = require('prompts')
import init from './init'
import state from './state'
import migrate from './migrate'
import rollback from './rollback'
import apply from './apply'
import { printHeader } from '../interactive-shell/shell'

const run = async () => {
  printHeader()
  if (process.env.FAUNA_LEGACY) {
    console.warn('FAUNA_LEGACY, is not supported for the run task, ignoring the variable.')
  }
  
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: 'Please choose an option',
    choices: [
      { title: 'init', description: 'Initializing folders and config', value: 'INIT' },
      { title: 'state', description: 'Get the current state of cloud and local migrations', value: 'STATE' },
      { title: 'generate', description: 'Generate migration from your resources', value: 'GENERATE' },
      { title: 'rollback', description: 'Rollback applied migrations in the database', value: 'ROLLBACK' },
      { title: 'apply', description: 'Apply unapplied migrations against the database', value: 'APPLY' },
    ]
  });

  switch (response.value) { 
    case 'INIT':
      await init()
      break
    case 'STATE':
      await state()
      break;
    case 'GENERATE':
      await migrate()
      break;
    case 'ROLLBACK':
      rollback()
      break;
    case 'APPLY':
      await apply()
      break
    default:
      break
  }
}


export default run
