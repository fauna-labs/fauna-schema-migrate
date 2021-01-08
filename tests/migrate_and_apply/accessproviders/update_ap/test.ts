
import path from 'path'
import test, { ExecutionContext } from 'ava';
import { fullApply, setupFullTest, destroyFullTest } from '../../../_helpers'
import { getAllCloudResources } from '../../../../src/state/from-cloud'

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
    faunaClient = await setupFullTest(testPath)
})

test('generate crete ap and update ap migration', async (t: ExecutionContext) => {
    try {
        await fullApply(testPath, ['resources1'])
        let result = await getAllCloudResources(faunaClient)
        t.is(result.AccessProvider.length, 1)
        t.truthy(result.AccessProvider.find(x => x.name === 'Auth0-myapp'))
        await fullApply(testPath, ['resources2'])
        result = await getAllCloudResources(faunaClient)
        t.is(result.AccessProvider.length, 1)
        t.is(result.Role.length, 1)
        t.truthy(result.AccessProvider.find(x => x.name === 'Auth0-myapp'))
        t.truthy(result.Role.find(x => x.name === 'powerless'))
        // Verify whether the body is correct.

        let accessProviderBody = {
            "name": "Auth0-myapp",
            "issuer": "https://myapp.auth0.com/",
            "jwks_uri": "https://myapp.auth0.com/.well-known/jwks.json",
            "roles": [
                {
                    "@ref": {
                        "id": "powerless",
                        "collection": {
                            "@ref": {
                                "id": "roles"
                            }
                        }
                    }
                }
            ]
        }
        delete result.AccessProvider[0].json['audience']
        delete result.AccessProvider[0].json['ref']
        delete result.AccessProvider[0].json['ts']

        t.is(
            JSON.stringify(result.AccessProvider[0].json, null, 2),
            JSON.stringify(accessProviderBody, null, 2)
        )
    }
    catch (err) {
        console.log(err)
    }
})

test.after.always(async (t: ExecutionContext) => {
    await destroyFullTest(testPath)
})
