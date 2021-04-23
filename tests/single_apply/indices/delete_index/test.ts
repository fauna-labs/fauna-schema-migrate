// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import path from 'path'
import test, { ExecutionContext } from 'ava'
import { fullApply, setupFullTest, destroyFullTest } from '../../../_helpers'
import { getAllCloudResources } from '../../../../src/state/from-cloud'

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
  faunaClient = await setupFullTest(testPath)
})

test('generate create_collection with index and delete index again in next step', async (t: ExecutionContext) => {
  await fullApply(testPath, ['resources1'])
  let result = await getAllCloudResources(faunaClient)
  t.is(result.Index.length, 1)
  t.is(result.Collection.length, 2)
  t.truthy(result.Index.find((x) => x.name === 'users_by_email'))
  await fullApply(testPath, ['resources2'])
  result = await getAllCloudResources(faunaClient)
  // the index is gone.
  t.is(result.Index.length, 0)
  // the collection is still there
  t.is(result.Collection.length, 2)
})

test.after.always(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
