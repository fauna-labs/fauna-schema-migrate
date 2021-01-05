
import path from 'path'
import test, { ExecutionContext } from 'ava';
import { fullApply, setupFullTest, destroyFullTest } from '../../_helpers'
import { CircularMigrationError } from '../../../src/errors/CircularMigrationError';

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
    faunaClient = await setupFullTest(testPath)
})

test('conflicting (circular) dependencies test', async (t: ExecutionContext) => {
    try {
        await t.throwsAsync(async () => {
            // indexes can't be updated.
            await fullApply(testPath)
        }, { instanceOf: CircularMigrationError })
    }
    catch (err) {
        console.log(err)
    }
})

test.after(async (t: ExecutionContext) => {
    await destroyFullTest(testPath)
})


