// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import path from 'path'
import test, { ExecutionContext } from 'ava'
import { fullApply, setupFullTest, destroyFullTest } from '../../../_helpers'
import { UpdateIndexError } from '../../../../src/errors/UpdateIndexError'

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
  faunaClient = await setupFullTest(testPath)
})

test('generate create_index and update_index migration', async (t: ExecutionContext) => {
  await fullApply(testPath, ['resources1'])
  await t.throwsAsync(
    async () => {
      // indexes can't be updated.
      await fullApply(testPath, ['resources2'])
    },
    { instanceOf: UpdateIndexError }
  )
})

test.after.always(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
