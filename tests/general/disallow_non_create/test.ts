// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import path from 'path'
import test, { ExecutionContext } from 'ava'
import { fullApply, setupFullTest, destroyFullTest } from '../../_helpers'
import { getAllCloudResources } from '../../../src/state/from-cloud'
import { UpdateIndexError } from '../../../src/errors/UpdateIndexError'
import { WrongResourceTypeError } from '../../../src/errors/WrongResourceTypeError'

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
  faunaClient = await setupFullTest(testPath)
})

test('generate create_role and update_role migration', async (t: ExecutionContext) => {
  await t.throwsAsync(
    async () => {
      // indexes can't be updated.
      await fullApply(testPath)
    },
    { instanceOf: WrongResourceTypeError }
  )
})

test.after.always(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
