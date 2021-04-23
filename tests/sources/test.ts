// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import test, { ExecutionContext } from 'ava'
import path from 'path'
import { getSnippetsFromPaths } from '../../src/state/from-code'

test('simple snippets are equal regardless of their source format', async (t: ExecutionContext) => {
  const testPath = path.relative(process.cwd(), __dirname)
  const snippets1 = await getSnippetsFromPaths([path.join(testPath, 'resourcesFQL/accounts.fql')])
  const snippets2 = await getSnippetsFromPaths([path.join(testPath, 'resourcesJS/accounts.js')])
  const snippets3 = await getSnippetsFromPaths([path.join(testPath, 'resourcesTS/_accounts.ts')])

  t.deepEqual(snippets1, snippets2)
  t.deepEqual(snippets2, snippets3)
})

// todo, extend with advanced examples.
