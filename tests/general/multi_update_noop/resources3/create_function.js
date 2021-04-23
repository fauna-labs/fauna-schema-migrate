// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

const faunadb = require('faunadb'),
  q = faunadb.query

export default q.CreateFunction({
  name: 'login',
  role: q.Role('read_users'),
  body: q.Query(
    q.Lambda(
      ['email', 'password'],
      q.Let(
        {
          res: q.Login(q.Match(q.Index('users_by_email'), q.Var('email')), {
            password: q.Var('password'),
          }),
          user: q.Get(q.Select(['instance'], q.Var('res'))),
          secret: q.Select(['secret'], q.Var('res')),
        },
        { user: q.Var('user'), secret: q.Var('secret') }
      )
    )
  ),
})
