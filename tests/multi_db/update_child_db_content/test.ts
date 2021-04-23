// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import path from 'path'
import test, { ExecutionContext } from 'ava'
import { fullApply, setupFullTest, destroyFullTest, multiDatabaseFullApply } from '../../_helpers'
import { getAllCloudResources } from '../../../src/state/from-cloud'
import rollback from '../../../src/tasks/rollback'
import { clientGenerator } from '../../../src/util/fauna-client'

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

  let child2Client = await clientGenerator.getClient(['child2'])
  let child2Res = await getAllCloudResources(child2Client)
  t.is(child2Res.Collection.length, 2)

  let child1aClient = await clientGenerator.getClient(['child1', 'child1a'])
  let child1aRes = await getAllCloudResources(child1aClient)
  t.is(child1aRes.Collection.length, 2)

  await multiDatabaseFullApply(
    testPath,
    ['resources2'],
    // the databases to apply (these all happen in a separate transaction)
    [[], ['child1'], ['child2'], ['child1', 'child1a']]
  )

  child2Client = await clientGenerator.getClient(['child2'])
  child2Res = await getAllCloudResources(child2Client)
  t.is(child2Res.Collection.length, 1)
  t.is(child2Res.Function.length, 1)

  child1aClient = await clientGenerator.getClient(['child1', 'child1a'])
  child1aRes = await getAllCloudResources(child1aClient)
  t.is(child1aRes.Collection.length, 2)
  t.is(child1aRes.Function.length, 1)
  const coll: any = child1aRes.Collection.find((x) => x.name === 'child1a_collection')
  t.is(coll.jsonData.data.random, 42)
})

test.after(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
