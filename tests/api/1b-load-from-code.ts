// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import * as fauna from 'faunadb'

import test, { ExecutionContext } from 'ava'
import { getSnippetsFromCode } from '../../src/state/from-code'
const q = fauna.query

test('snippets can be loaded from code', async (t: ExecutionContext) => {
  const snippets = getSnippetsFromCode([q.CreateCollection({ name: 'accounts' })])
  t.is(snippets.Collection.length, 1)
})
