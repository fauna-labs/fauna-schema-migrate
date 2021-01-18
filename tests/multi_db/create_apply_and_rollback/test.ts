
import path from 'path'
import test, { ExecutionContext } from 'ava';
import { fullApply, setupFullTest, destroyFullTest } from '../../_helpers'
import { getAllCloudResources } from '../../../src/state/from-cloud'
import rollback from '../../../src/tasks/rollback';

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
    faunaClient = await setupFullTest(testPath)
})

test('generate create_collection migration', async (t: ExecutionContext) => {
    await fullApply(testPath)
    const result = await getAllCloudResources(faunaClient)
    t.is(result.Database.length, 2)

    await rollback(1)
    const result2 = await getAllCloudResources(faunaClient)
    t.is(result2.Database.length, 0)
})

test.after(async (t: ExecutionContext) => {
    await destroyFullTest(testPath)
})


