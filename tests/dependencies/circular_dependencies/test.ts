// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import path from 'path'
import test, { ExecutionContext } from 'ava'
import { fullApply, setupFullTest, destroyFullTest } from '../../_helpers'
import { getAllCloudResources } from '../../../src/state/from-cloud'

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
  faunaClient = await setupFullTest(testPath)
})

test('conflicting (circular) dependencies test', async (t: ExecutionContext) => {
  await fullApply(testPath)
  // adapted to allow circular dependencies.
  const result = await getAllCloudResources(faunaClient)
  t.is(result.Collection.length, 3)
  t.truthy(result.Collection.find((x) => x.name === 'migrations'))
  t.truthy(result.Collection.find((x) => x.name === 'collection1'))
  t.truthy(result.Collection.find((x) => x.name === 'collection2'))
  const coll1: any = result.Collection.find((x) => x.name === 'collection1')
  const coll2: any = result.Collection.find((x) => x.name === 'collection2')

  // check whether objects are complete.
  t.is(
    coll1.jsonData.data.metadata,
    "some metadata for this collection, even if it's strange we'll link it to some other collection"
  )
  t.is(
    coll2.jsonData.data.metadata,
    "some metadata for this collection, even if it's strange we'll link it to some other collection"
  )
  t.is(coll1.jsonData.data.role.value.id, 'collection2')
  t.is(coll2.jsonData.data.role.value.id, 'collection1')
})

test.after(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
