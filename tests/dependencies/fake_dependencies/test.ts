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

test('test FQL statemetns for false positivies', async (t: ExecutionContext) => {
  await fullApply(testPath)
  // adapted to allow circular dependencies.
  const result = await getAllCloudResources(faunaClient)

  // if it doesn't throw na error, were good.
  t.pass()
})

test.after(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
