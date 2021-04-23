// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import * as fauna from 'faunadb'
import test, { ExecutionContext } from 'ava'
import { getSnippetsFromStrings } from '../../src/state/from-code'
import { diffSnippets } from '../../src/migrations/diff'
import { generateMigrations } from '../../src/migrations/generate-migration'
import { generateMigrationLetObject } from '../../src/migrations/generate-query'
import { prettyPrintExpr } from '../../src/fql/print'

test('we can generate a let object from code', async (t: ExecutionContext) => {
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
  const letObj = generateMigrationLetObject(migrations)
  // An object is returned with variables which could be used inside a Let
  // You don't need this if you want to follow the same approach as the library.
  // However, you can also create your own Let with custom body by using this.
  const customLet = fauna.query.Let(letObj, true)
  compareFql(
    t,
    prettyPrintExpr(customLet),
    `Let([{
        var0: Select(["ref"], Delete(Collection("accounts")))
      }, {
        var1: Select(["ref"], Update(Function("foo"), {
          body: Query(Lambda([], Subtract(2, 2))),
          data: null,
          role: null
        }))
      }, {
        var2: Select(["ref"], CreateCollection({
          name: "users"
        }))
      }, {
        var3: Select(["ref"], CreateCollection({
          name: "books"
        }))
      }], true)
      `
  )
})

const compareFql = (t: ExecutionContext, s1: string, s2: string) => {
  t.is(s1.replace(/\s/g, ''), s2.replace(/\s/g, ''))
}
