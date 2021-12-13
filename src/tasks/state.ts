// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { isMissingMigrationCollectionFaunaError } from '../errors/detect-errors'
import { printMessage, renderMigrationsMinmal } from '../interactive-shell/shell'
import { retrieveMigrationInfo } from '../migrations/advance'
import { clientGenerator } from '../util/fauna-client'
const cliSpinners = require('cli-spinners');
const process = require('process')
const std = process.stdout
const rdl = require('readline')

const apply = async () => {
  try {
    const client = await clientGenerator.getClient()

    console.clear()
    let frame = 0;
    let isLoading = setInterval(function() {
      frame = (frame + 1 === cliSpinners.dots.frames.length) ? 0 : frame + 1
      std.write(cliSpinners.dots.frames[frame])
      rdl.cursorTo(std, 0, 0)
    }, cliSpinners.dots.interval)

    printMessage(` Retrieving current cloud migration state`)
    const migInfo = await retrieveMigrationInfo(client)
    clearInterval(isLoading)
    const allCloudMigrationTimestamps = migInfo.allCloudMigrations.map((e) => e.timestamp)

    printMessage(`✔ Retrieved current migration state`, 'success')
    renderMigrationsMinmal(allCloudMigrationTimestamps, migInfo.allLocalMigrations, 'state', 0)
  } catch (error) {
    const missingMigrDescription = isMissingMigrationCollectionFaunaError(error)
    if (missingMigrDescription) {
      printMessage(`The migrations collection is missing, \n did you run 'init' first?`, 'error')
      return;
    } else {
      throw error
    }
  }
}

export default apply
