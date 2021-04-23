// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import path from 'path'
import test, { ExecutionContext } from 'ava'
import { fullApply, setupFullTest, destroyFullTest } from '../../_helpers'
import { DuplicateResourceError } from '../../../src/errors/DuplicateResourceError'

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
  faunaClient = await setupFullTest(testPath)
})

test('conflicting (duplicate naming) dependencies test', async (t: ExecutionContext) => {
  await t.throwsAsync(
    async () => {
      // indexes can't be updated.
      await fullApply(testPath)
    },
    { instanceOf: DuplicateResourceError }
  )
})

test.after(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
