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

test('generate create_collection and create_index migration', async (t: ExecutionContext) => {
  await fullApply(testPath)
  const result = await getAllCloudResources(faunaClient)
  t.is(result.Collection.length, 2)
  t.truthy(result.Collection.find((x) => x.name === 'migrations'))
  t.truthy(result.Collection.find((x) => x.name === 'users'))

  t.is(result.Index.length, 1)
  t.truthy(result.Index.find((x) => x.name === 'users_by_email'))
})

test.after.always(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
