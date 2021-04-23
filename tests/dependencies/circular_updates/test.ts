// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import path from 'path'
import test, { ExecutionContext } from 'ava'
import { fullApply, setupFullTest, destroyFullTest } from '../../_helpers'
import { CircularMigrationError } from '../../../src/errors/CircularMigrationError'

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
  faunaClient = await setupFullTest(testPath)
})

test('circular updates should of course remain possible', async (t: ExecutionContext) => {
  await fullApply(testPath, ['resources1'])
  await fullApply(testPath, ['resources2'])
  // pass since the test did not throw an error.
  t.pass()
})

test.after(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
