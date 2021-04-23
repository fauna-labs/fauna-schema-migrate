// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import test, { ExecutionContext } from 'ava'
import { getSnippetsFromStrings } from '../../src/state/from-code'
import { diffSnippets } from '../../src/migrations/diff'
import { generateMigrations } from '../../src/migrations/generate-migration'
import { StatementType, TaggedExpression } from '../../src/types/expressions'

test('we can generatemigrations from code', async (t: ExecutionContext) => {
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

  // function is transformed to update statement.
  const fooFunction: TaggedExpression | undefined = migrations.find((x: TaggedExpression) => x.name === 'foo')
  t.is(fooFunction?.statement, StatementType.Update)
  compareFql(
    t,
    fooFunction?.fql as string,
    `Update(Function("foo"), { body: Query(Lambda([], Subtract(2, 2))), data: null, role: null}) `
  )

  // users remains a create statement.
  const usersCollection: TaggedExpression | undefined = migrations.find((x: TaggedExpression) => x.name === 'users')
  t.is(usersCollection?.statement, StatementType.Create)
  compareFql(t, usersCollection?.fql as string, `CreateCollection({name: "users"})`)

  // books remains a create statement.
  const booksCollection: TaggedExpression | undefined = migrations.find((x: TaggedExpression) => x.name === 'books')
  t.is(booksCollection?.statement, StatementType.Create)
  compareFql(t, booksCollection?.fql as string, `CreateCollection({name: "books"})`)

  // accounts remains a create statement.
  const accountsCollection: TaggedExpression | undefined = migrations.find(
    (x: TaggedExpression) => x.name === 'accounts'
  )
  t.is(accountsCollection?.statement, StatementType.Delete)
  compareFql(t, accountsCollection?.fql as string, `Delete(Collection("accounts"))`)
})

const compareFql = (t: ExecutionContext, s1: string, s2: string) => {
  t.is(s1.replace(/\s/g, ''), s2.replace(/\s/g, ''))
}
