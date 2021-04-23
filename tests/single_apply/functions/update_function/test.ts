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

test('generate create_function and update_function migration', async (t: ExecutionContext) => {
  await fullApply(testPath, ['resources1'])
  let result = await getAllCloudResources(faunaClient)
  // Verify whether the function exists
  t.is(result.Function.length, 1)
  t.truthy(result.Function.find((x) => x.name === 'multiply'))
  // Verify whether the body is correct.
  let functionBody = {
    multiply: [
      {
        var: 'var1',
      },
      {
        var: 'var2',
      },
    ],
  }

  t.is(JSON.stringify(result.Function[0].jsonData.body.value.expr, null, 2), JSON.stringify(functionBody, null, 2))
  await fullApply(testPath, ['resources2'])
  result = await getAllCloudResources(faunaClient)
  functionBody = {
    multiply: [
      {
        var: 'var2',
      },
      {
        var: 'var1',
      },
    ],
  }
  t.is(JSON.stringify(result.Function[0].jsonData.body.value.expr, null, 2), JSON.stringify(functionBody, null, 2))
})

test.after.always(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
