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

test('generate create_collection and update_collection migration', async (t: ExecutionContext) => {
  // Apply the first state of the resources.
  await fullApply(testPath, ['resources1'])
  const result = await getAllCloudResources(faunaClient)
  t.is(result.Collection.length, 2)
  t.truthy(result.Collection.find((x) => x.name === 'migrations'))
  t.truthy(result.Collection.find((x) => x.name === 'test1'))
  const test1Collection: any = result.Collection.find((x) => x.name === 'test1')
  t.falsy(test1Collection.jsonData.data)
  // Apply the new resources.
  const res = await fullApply(testPath, ['resources2'])
  const result2 = await getAllCloudResources(faunaClient)
  const test1Collection2: any = result2.Collection.find((x) => x.name === 'test1')
  t.is(test1Collection2.jsonData.data.foo, 'barmetadata')
})

test.after.always(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
