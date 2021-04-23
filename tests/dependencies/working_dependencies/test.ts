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

test('generate dependent migrations test 1', async (t: ExecutionContext) => {
  await fullApply(testPath)
  const result = await getAllCloudResources(faunaClient)
  t.is(result.Collection.length, 3)
  t.is(result.Function.length, 1)
  t.is(result.Index.length, 2)
  t.is(result.Role.length, 2)
  t.is(result.AccessProvider.length, 1)
})

test.after(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
