// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import path from 'path'
import test, { ExecutionContext } from 'ava'
import { fullApply, setupFullTest, destroyFullTest } from '../../_helpers'
import { DuplicateResourceError } from '../../../src/errors/DuplicateResourceError'
import { UndefinedReferenceError } from '../../../src/errors/UndefinedReferenceError'
import { getAllCloudResources } from '../../../src/state/from-cloud'

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
  faunaClient = await setupFullTest(testPath)
})

test('referencing undefined dependencies test', async (t: ExecutionContext) => {
  // first resource folder contains something that looks like a function
  // but is a user defined object.
  await fullApply(testPath, ['resources1'])
  const result = await getAllCloudResources(faunaClient)
  t.is(result.Collection.length, 2)
  t.truthy(result.Collection.find((x) => x.name === 'migrations'))
  t.truthy(result.Collection.find((x) => x.name === 'collection1'))
  // Second resource folder contains a function which is not defined in our
  // resources.
  await t.throwsAsync(
    async () => {
      await fullApply(testPath, ['resources2'])
    },
    { instanceOf: UndefinedReferenceError }
  )
})

test.after(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
