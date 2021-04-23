// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import test, { ExecutionContext } from 'ava'
import { getSnippetsFromStrings } from '../../src/state/from-code'
import { diffSnippets } from '../../src/migrations/diff'

test('snippets can be diffed from code', async (t: ExecutionContext) => {
  const snippets1 = getSnippetsFromStrings([
    "CreateCollection({ name: 'accounts' })",
    `CreateFunction({
            name: 'foo',
            body: Query(Lambda([],
              Add(2,2)
            ))
        })`,
    "CreateCollection({ name: 'shops' })",
  ])
  const snippets2 = getSnippetsFromStrings([
    "CreateCollection({ name: 'books' })",
    "CreateCollection({ name: 'users' })",
    `CreateFunction({
            name: 'foo',
            body: Query(Lambda([],
              Subtract(2,2)
            ))
        })`,
    "CreateCollection({ name: 'shops' })",
  ])

  const diff = diffSnippets(snippets1, snippets2)
  t.is(diff.Collection.added.length, 2)
  t.is(diff.Collection.unchanged.length, 1)
  t.is(diff.Collection.deleted.length, 1)
  t.is(diff.Function.changed.length, 1)
})
