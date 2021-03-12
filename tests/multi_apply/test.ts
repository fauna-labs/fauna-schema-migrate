import path from 'path'
import test, { ExecutionContext } from 'ava'
import { fullApply, setupFullTest, destroyFullTest, rollback, multiStepFullApply } from '../_helpers'
import { getAllCloudResources } from '../../src/state/from-cloud'
import { LoadedResources } from '../../src/types/expressions'
import { ResourceTypes } from '../../src/types/resource-types'

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
  faunaClient = await setupFullTest(testPath)
})

test('multi apply is the same as separate apply', async (t: ExecutionContext) => {
  // increase timeout since we'll have caching errors.
  t.timeout(70000)
  // first generate and apply migrations
  await multiStepFullApply(testPath, ['resources1', 'resources2', 'resources3', 'resources4'], 4)
  const result = await getAllCloudResources(faunaClient)
  t.is(result.Collection.length, 4)
  t.truthy(result.Collection.find((x) => x.name === 'migrations'))
  t.truthy(result.Collection.find((x) => x.name === 'test1'))
  t.truthy(result.Collection.find((x) => x.name === 'test4'))
  t.truthy(result.Collection.find((x) => x.name === 'test5'))
})

test.after(async (t: ExecutionContext) => {
  await destroyFullTest(testPath)
})
