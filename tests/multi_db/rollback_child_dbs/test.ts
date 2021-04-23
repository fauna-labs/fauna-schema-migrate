// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import path from 'path'
import test, { ExecutionContext } from 'ava'
import { fullApply, setupFullTest, destroyFullTest, multiDatabaseFullApply } from '../../_helpers'
import { getAllCloudResources } from '../../../src/state/from-cloud'
import rollback from '../../../src/tasks/rollback'
import { clientGenerator } from '../../../src/util/fauna-client'
import { LoadedResources } from '../../../src/types/expressions'
import { ResourceTypes } from '../../../src/types/resource-types'

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
  faunaClient = await setupFullTest(testPath)
})

test.skip('update child database contents', async (t: ExecutionContext) => {
  await multiDatabaseFullApply(
    testPath,
    ['resources1'],
    // the databases to apply (these all happen in a separate transaction)
    [[], ['child1'], ['child2'], ['child1', 'child1a']]
  )

  const child2Client = await clientGenerator.getClient(['child2'])
  const child2Res = await getAllCloudResources(child2Client)

  const child1aClient = await clientGenerator.getClient(['child1', 'child1a'])
  const child1aRes = await getAllCloudResources(child1aClient)

  await multiDatabaseFullApply(
    testPath,
    ['resources2'],
    // the databases to apply (these all happen in a separate transaction)
    [[], ['child1'], ['child2'], ['child1', 'child1a']]
  )

  await rollback(1, ['child1', 'child1a'])
  await rollback(1, ['child2'])

  const child2ResAfterRollback = await getAllCloudResources(child2Client)
  const child1aResAfterRollback = await getAllCloudResources(child1aClient)
  compareResults(t, child2ResAfterRollback, child2Res)
  compareResults(t, child1aResAfterRollback, child1aRes)
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
      // Which contains the same data.
      t.deepEqual(rollbackRes?.fqlExpr, beforeRes?.fqlExpr)
    }
  }
}
