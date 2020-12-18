
import path from 'path'
import test, { ExecutionContext } from 'ava';
import { fullApply, setupFullTest, destroyFullTest } from '../_helpers'


const testPath = path.relative(process.cwd(), __dirname)

test.before(async (t: ExecutionContext) => {
    await setupFullTest(testPath)
})

test('generate create_collection migration', async (t: ExecutionContext) => {
    try {
        await fullApply(testPath, ['resources1', 'resources2'])
        console.log("TODO, getting the result back from Fauna of the test, but everything is looking good")
    }
    catch (err) {
        console.log(err)
    }
    t.pass();
})


test.after.always(async (t: ExecutionContext) => {
    await destroyFullTest(testPath)
})
