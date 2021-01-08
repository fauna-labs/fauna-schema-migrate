
import path from 'path'
import test, { ExecutionContext } from 'ava';
import { fullApply, setupFullTest, destroyFullTest } from '../../../_helpers'
import { getAllCloudResources } from '../../../../src/state/from-cloud'
import { UpdateIndexError } from '../../../../src/errors/UpdateIndexError';

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
    faunaClient = await setupFullTest(testPath)
})

test('generate create_role and update_role migration', async (t: ExecutionContext) => {
    await fullApply(testPath, ['resources1'])
    let result = await getAllCloudResources(faunaClient)
    t.is(result.Role.length, 1)
    t.truthy(result.Role.find(x => x.name === 'access_users'))

    await fullApply(testPath, ['resources2'])
    result = await getAllCloudResources(faunaClient)
    t.is(result.Role.length, 1)
    t.is(result.Collection.length, 2)
    t.truthy(result.Role.find(x => x.name === 'access_users'))
    t.truthy(result.Collection.find(x => x.name === 'users'))
    // Verify whether the body is correct.
    let rolePrivileges = [
        {
            "resource":
            {
                "@ref":
                {
                    "id": "users", "collection":
                        { "@ref": { "id": "collections" } }
                }
            },
            "actions": { "create": true, "read": true }
        }]
    t.is(
        JSON.stringify(result.Role[0].json.privileges, null, 2),
        JSON.stringify(rolePrivileges, null, 2)
    )
})


test.after.always(async (t: ExecutionContext) => {
    await destroyFullTest(testPath)
})
