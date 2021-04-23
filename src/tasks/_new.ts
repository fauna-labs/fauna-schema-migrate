// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import chalk from 'chalk'
import { writeNewMigrationDir } from '../util/files'

// Not used atm. Might be a different modus if people
// want to write migrations by hand (in which case 'generate' is not available)
// and there is no resources folder. Reach out if this makes sense/is necessary.
const newMigration = async () => Promise.resolve()

export default newMigration
