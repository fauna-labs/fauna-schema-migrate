// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { interactiveShell } from '../interactive-shell/interactive-shell'
const run = async () => {
  if (process.env.FAUNA_LEGACY) {
    console.warn('FAUNA_LEGACY, is not supported for the run task, ignoring the variable.')
  }
  await interactiveShell.start()
}

export default run
