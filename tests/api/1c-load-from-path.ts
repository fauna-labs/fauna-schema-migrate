// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import test, { ExecutionContext } from 'ava'
import { getSnippetsFromPaths } from '../../src/state/from-code'

test('snippets can be loaded from FQL paths', async (t: ExecutionContext) => {
  const snippets = await getSnippetsFromPaths(['tests/api/resourcesFQL/accounts.fql'])
  t.is(snippets.Collection.length, 1)
})

test('snippets can be loaded from JS paths', async (t: ExecutionContext) => {
  const snippets = await getSnippetsFromPaths(['tests/api/resourcesJS/accounts.js'])
  t.is(snippets.Collection.length, 1)
})

test('snippets can be loaded from TS paths', async (t: ExecutionContext) => {
  const snippets = await getSnippetsFromPaths(['tests/api/resourcesTS/_accounts.ts'])
  t.is(snippets.Collection.length, 1)
})
