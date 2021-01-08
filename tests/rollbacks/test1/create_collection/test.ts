
import path from 'path'
import test, { ExecutionContext } from 'ava';
import { fullApply, setupFullTest, destroyFullTest, rollback } from '../../../_helpers'
import { getAllCloudResources } from '../../../../src/state/from-cloud'

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
    faunaClient = await setupFullTest(testPath)
})

test('generate create_collection migration', async (t: ExecutionContext) => {
    try {
        // first generate and apply migrations
        await fullApply(testPath, ['resources1'])
        const result1 = await getAllCloudResources(faunaClient)
        await fullApply(testPath, ['resources2'])
        const result2 = await getAllCloudResources(faunaClient)
        await fullApply(testPath, ['resources3'])
        const result3 = await getAllCloudResources(faunaClient)
        await fullApply(testPath, ['resources4'])
        const result4 = await getAllCloudResources(faunaClient)
        // then turn back.
        await rollback(1)
        const result3b = await getAllCloudResources(faunaClient)
        await rollback(1)
        const result2b = await getAllCloudResources(faunaClient)
        await rollback(1)
        const result1b = await getAllCloudResources(faunaClient)

        t.pass()
    }
    catch (err) {
        console.log(err)
    }
})

test.after(async (t: ExecutionContext) => {
    // await destroyFullTest(testPath)
})


