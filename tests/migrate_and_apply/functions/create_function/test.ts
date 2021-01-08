
import path from 'path'
import test, { ExecutionContext } from 'ava';
import { fullApply, setupFullTest, destroyFullTest } from '../../../_helpers'
import { getAllCloudResources } from '../../../../src/state/from-cloud'

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
    faunaClient = await setupFullTest(testPath)
})

test('generate create_function migration', async (t: ExecutionContext) => {
    await fullApply(testPath)
    const result = await getAllCloudResources(faunaClient)
    // Verify whether the function exists
    t.is(result.Function.length, 1)
    t.truthy(result.Function.find(x => x.name === 'multiply'))
    // Verify whether the body is correct.
    const functionBody = {
        "@query": {
            "lambda": [
                "var1",
                "var2"
            ],
            "expr": {

                "multiply": [
                    {
                        "var": "var1"
                    },
                    {
                        "var": "var2"
                    }
                ]
            }
        }
    }
    delete result.Function[0].json.body["@query"]['api_version']
    t.is(
        JSON.stringify(result.Function[0].json.body, null, 2),
        JSON.stringify(functionBody, null, 2)
    )

})

test.after(async (t: ExecutionContext) => {
    await destroyFullTest(testPath)
})


