
import * as fauna from 'faunadb'
const q = fauna.query

import test, { ExecutionContext } from 'ava';
import { getSnippetsFromCode } from '../../src/state/from-code'

test('snippets can be loaded from code', async (t: ExecutionContext) => {
    const snippets = getSnippetsFromCode([
        q.CreateCollection({ name: 'accounts' })
    ])
    t.is(snippets.Collection.length, 1)
})
