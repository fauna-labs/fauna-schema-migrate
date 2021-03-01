
import path from 'path'
import test, { ExecutionContext } from 'ava';
import { getSnippetsFromCode } from '../../src/state/from-code'
import { diffSnippets } from '../../src/migrations/diff'

test('snippets can be loaded from code', async (t: ExecutionContext) => {
    const snippets = getSnippetsFromCode([
        `CreateCollection({ name: 'accounts' })`,
        `CreateFunction({
            name: 'foo',
            body: Query(Lambda([],
              Add(2,2)
            ))
        })`,
        `CreateAccessProvider({
            name: 'Auth0-myapp',
            issuer: 'https://myapp.auth0.com/',
            jwks_uri: 'https://myapp.auth0.com/.well-known/jwks.json',
        })`,
        `CreateDatabase({ name: 'db-next' })`,
        `CreateIndex({
            name: 'new-index',
            source: Collection('accounts'),
        })`,
        `CreateRole({
            name: 'new-role',
            privileges: {
              resource: Collection('accounts'),
              actions: { read: true },
            },
        })`
    ])
    t.is(snippets.Collection.length, 1)
    t.is(snippets.Function.length, 1)
    t.is(snippets.AccessProvider.length, 1)
    t.is(snippets.Database.length, 1)
    t.is(snippets.Index.length, 1)
    t.is(snippets.Role.length, 1)

})
