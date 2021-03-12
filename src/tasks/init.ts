import { config } from '../util/config'
import * as files from '../util/files'
import { interactiveShell } from '../interactive-shell/interactive-shell'

const init = async () => {
  // Create configuration file
  interactiveShell.startSubtask(`Writing configuration file}`)
  const fullPath = await config.writeConfig()
  if (fullPath) {
    interactiveShell.completeSubtask(`Wrote configuration file ${fullPath}`)
  } else {
    interactiveShell.completeSubtask(`Nothing to do, file exists`)
  }

  // Create directories
  interactiveShell.startSubtask(`Generating default directories`)
  await files.generateDefaultDirs()
  interactiveShell.completeSubtask(`Generated default directories`)
}

export default init
