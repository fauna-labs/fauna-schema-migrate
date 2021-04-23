// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import path from 'path'
import test, { ExecutionContext } from 'ava'
import { fullApply, setupFullTest, destroyFullTest } from '../../_helpers'
import { getAllCloudResources } from '../../../src/state/from-cloud'
import { retrieveAllMigrations } from '../../../src/util/files'

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
  faunaClient = await setupFullTest(testPath)
})

test('Noop updates do not create migrations', async (t: ExecutionContext) => {
  await fullApply(testPath, ['resources1'])
  let result = await getAllCloudResources(faunaClient)

  await fullApply(testPath, ['resources2'])
  result = await getAllCloudResources(faunaClient)

  await fullApply(testPath, ['resources3'])
  result = await getAllCloudResources(faunaClient)
  const migrations = await retrieveAllMigrations()

  // Test
  t.is(migrations.length, 2)
})

test.after.always(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
