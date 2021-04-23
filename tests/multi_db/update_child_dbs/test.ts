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

test.skip('update child databases', async (t: ExecutionContext) => {
  await multiDatabaseFullApply(testPath, ['resources1'], [[], ['child1'], ['child2']])

  // there are two child databases
  let result = await getAllCloudResources(faunaClient)
  t.is(result.Database.length, 2)
  let child1Client = await clientGenerator.getClient(['child1'])

  // There are two child databases within child1.
  let result2 = await getAllCloudResources(child1Client)
  t.is(result2.Database.length, 2)

  await multiDatabaseFullApply(testPath, ['resources2'], [[], ['child1']])

  result = await getAllCloudResources(faunaClient)
  t.is(result.Database.length, 1)
  child1Client = await clientGenerator.getClient(['child1'])

  result2 = await getAllCloudResources(child1Client)
  t.is(result2.Database.length, 1)
  t.truthy(result2.Database.find((x) => x.name === 'child1a'))

  await multiDatabaseFullApply(testPath, ['resources3'], [[], ['child1']])
  // there are two child databases
  result = await getAllCloudResources(faunaClient)
  t.is(result.Database.length, 3)
  child1Client = await clientGenerator.getClient(['child1'])

  result2 = await getAllCloudResources(child1Client)
  t.is(result2.Database.length, 1)
  t.truthy(result2.Database.find((x) => x.name === 'child1b'))
})

test.after(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
