// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { config } from '../util/config'
import * as files from '../util/files'
import { interactiveShell } from '../interactive-shell/interactive-shell'
import { printMessage } from '../interactive-shell/shell'

const init = async () => {
  // Create configuration file
  printMessage(`Writing configuration file`, 'info');
  const fullPath = await config.writeConfig()
  if (fullPath) {
    printMessage(`✅ Wrote configuration file ${fullPath}`, 'success');
  } else {
    printMessage(`✅ Nothing to do, file exists`, 'success');
  }

  // Create directories
  printMessage(`Generating default directories`, 'info');
  await files.generateDefaultDirs()
  printMessage(`✅ Generated default directories`, 'success');
  interactiveShell.close()
}

export default init
