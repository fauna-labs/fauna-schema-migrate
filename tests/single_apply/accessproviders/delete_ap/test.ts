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

test('generate create ap and delete it again in next step', async (t: ExecutionContext) => {
  await fullApply(testPath, ['resources1'])
  let result = await getAllCloudResources(faunaClient)
  t.is(result.AccessProvider.length, 1)
  t.truthy(result.AccessProvider.find((x) => x.name === 'Auth0-myapp'))
  await fullApply(testPath, ['resources2'])
  result = await getAllCloudResources(faunaClient)
  t.is(result.AccessProvider.length, 0)
})

test.after.always(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
