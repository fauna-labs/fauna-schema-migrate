// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import * as fauna from 'faunadb'
import test, { ExecutionContext } from 'ava'
import { getSnippetsFromStrings } from '../../src/state/from-code'
import { diffSnippets } from '../../src/migrations/diff'
import { generateMigrations } from '../../src/migrations/generate-migration'
import { generateApplyQuery } from '../../src/migrations/advance'
import { generateMigrationLetObject } from '../../src/migrations/generate-query'
import { prettyPrintExpr } from '../../src/fql/print'
const q = fauna.query

test('we can generate an apply query from code', async (t: ExecutionContext) => {
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
  const migrations = generateMigrations(diff)
  const query = generateApplyQuery(migrations, [], 'some-custom-migration-timestamp', 'migration-collection')

  // Apply is just a special case that already creates the Let for you.
  const letObj = generateMigrationLetObject(migrations)
  const customLet = q.Let(
    letObj,
    q.Map(
      ['some-custom-migration-timestamp'],
      q.Lambda(
        'migration',
        q.Create(q.Collection('migration-collection'), {
          data: {
            migration: q.Var('migration'),
          },
        })
      )
    )
  )

  // Apply is the equivalent of the above custom let.
  compareFql(t, prettyPrintExpr(query), prettyPrintExpr(customLet))
})

const compareFql = (t: ExecutionContext, s1: string, s2: string) => {
  t.is(s1.replace(/\s/g, '').replace(/(\r\n|\n|\r)/gm, ''), s2.replace(/\s/g, '').replace(/(\r\n|\n|\r)/gm, ''))
}
