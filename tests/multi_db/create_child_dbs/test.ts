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

test.skip('create child databases', async (t: ExecutionContext) => {
  await multiDatabaseFullApply(testPath, ['resources'], [[], ['child1']])

  // there are two child databases
  const result = await getAllCloudResources(faunaClient)
  t.is(result.Database.length, 2)
  const child1Client = await clientGenerator.getClient(['child1'])

  // There are two child databases within child1.
  const result2 = await getAllCloudResources(child1Client)
  t.is(result2.Database.length, 2)
})

test.after(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
