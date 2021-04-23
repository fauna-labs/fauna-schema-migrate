// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import path from 'path'
import test, { ExecutionContext } from 'ava'
import { fullApply, setupFullTest, destroyFullTest, rollback } from '../../_helpers'
import { getAllCloudResources } from '../../../src/state/from-cloud'
import { LoadedResources } from '../../../src/types/expressions'
import { ResourceTypes } from '../../../src/types/resource-types'

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
  faunaClient = await setupFullTest(testPath)
})

test('generate create_collection migration', async (t: ExecutionContext) => {
  // increase timeout since we'll have caching errors.
  t.timeout(70000)
  // first generate and apply migrations
  await fullApply(testPath, ['resources1'])
  const result1 = await getAllCloudResources(faunaClient)
  await fullApply(testPath, ['resources2'])
  const result2 = await getAllCloudResources(faunaClient)
  await fullApply(testPath, ['resources3'])
  const result3 = await getAllCloudResources(faunaClient)

  await fullApply(testPath, ['resources4'])
  // then turn back.

  await rollback(1)
  const result3b = await getAllCloudResources(faunaClient)
  compareResults(t, result3, result3b)

  await rollback(1)
  const result2b = await getAllCloudResources(faunaClient)
  compareResults(t, result2, result2b)

  await rollback(1)
  const result1b = await getAllCloudResources(faunaClient)
  compareResults(t, result1, result1b)
})

test.after(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})

const compareResults = (t: ExecutionContext, before: LoadedResources, rollback: LoadedResources) => {
  for (const resourceType in ResourceTypes) {
    const beforeRess = before[resourceType]
    const rollbackRess = rollback[resourceType]
    for (const beforeRes of beforeRess) {
      // test whether an equivalent resource with the same name exists
      const rollbackRes = rollbackRess.find((x) => x.name === beforeRes.name)
      t.truthy(rollbackRes)
      // console.('rollbackRes:', rollbackRes, 'beforeRes', beforeRes)
      // Which contains the same data.
      t.deepEqual(rollbackRes?.fqlExpr, beforeRes?.fqlExpr)
    }
  }
}
