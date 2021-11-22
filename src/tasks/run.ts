// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

const run = async () => {
  if (process.env.FAUNA_LEGACY) {
    console.warn('FAUNA_LEGACY, is not supported for the run task, ignoring the variable.')
  }
}

export default run
