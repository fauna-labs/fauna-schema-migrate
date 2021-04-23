// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import path from 'path'
import test, { ExecutionContext } from 'ava'
import { fullApply, setupFullTest, destroyFullTest } from '../../_helpers'
import { getAllCloudResources } from '../../../src/state/from-cloud'
import { UndefinedReferenceError } from '../../../src/errors/UndefinedReferenceError'

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
  faunaClient = await setupFullTest(testPath)
})

test('referencing undefined dependencies test', async (t: ExecutionContext) => {
  // first resource folder contains a collection that references a function.
  await fullApply(testPath, ['resources1'])
  const result = await getAllCloudResources(faunaClient)
  t.is(result.Collection.length, 2)
  t.truthy(result.Collection.find((x) => x.name === 'migrations'))
  t.truthy(result.Collection.find((x) => x.name === 'collection1'))
  // Second resource folder contains the same collection but the function
  // has been deleted. Since the collection still referneces it, this throws
  // an error.
  await t.throwsAsync(
    async () => {
      await fullApply(testPath, ['resources2'])
    },
    { instanceOf: UndefinedReferenceError }
  )
})

test.after(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
