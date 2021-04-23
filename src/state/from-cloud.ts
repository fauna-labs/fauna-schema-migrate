// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import * as fauna from 'faunadb'
import { LoadedResources, TaggedExpression, MigrationRefAndTimestamp } from '../types/expressions'
import { ResourceTypes } from '../types/resource-types'

import { config } from '../util/config'

const cloneDeep = require('lodash.clonedeep')

const q = fauna.query
const {
  Paginate,
  Var,
  Roles,
  Lambda,
  Collections,
  Get,
  Indexes,
  Databases,
  Functions,
  AccessProviders,
  Exists,
  If,
  CreateCollection,
  Collection,
  Reverse,
  Documents,
  Let,
  Select,
} = q

type Fun = (n: any) => any
type FQLFun = (n: any) => fauna.Expr

const batchSize = 100

const createQuery = (name: string) => CreateCollection({ name: name })

const wrapInCreate = (fetchQuery: any, name: string) => {
  return If(
    Exists(Collection(name)),
    fetchQuery(Collection(name)),
    Let(
      {
        col: createQuery(name),
        ref: Select(['ref'], Var('col')),
      },
      fetchQuery(Var('ref'))
    )
  )
}

export const createMigrationCollection = async (client: fauna.Client) => {
  const name = await config.getMigrationCollection()
  return await client.query(
    If(Exists(Collection(name)), false, CreateCollection({ name: await config.getMigrationCollection() }))
  )
}

export const retrieveAllCloudMigrations = async (client: fauna.Client): Promise<MigrationRefAndTimestamp[]> => {
  const name = await config.getMigrationCollection()
  const fetchQuery = (collectionRef: any) =>
    Let(
      {
        setref: Documents(collectionRef),
      },
      q.Map(
        Paginate(Var('setref'), { size: 10000 }),
        Lambda((x) => Get(x))
      )
    )
  const res: any = await client.query(wrapInCreate(fetchQuery, name))
  // we only need the timestamps and refs
  if (res) {
    return res.data
      .map((e: any) => {
        return {
          timestamp: e.data.migration,
          ref: e.ref,
        }
      })
      .sort((a: any, b: any) => (a.timestamp > b.timestamp ? 1 : -1))
  }
  return res
}

export const getAllCloudResources = async (client: fauna.Client): Promise<LoadedResources> => {
  const cloudResources = await Promise.all([
    await getAllResourcesOfType(client, ResourceTypes.Collection, Collections, remoteTsAndRef),
    await getAllResourcesOfType(client, ResourceTypes.Index, Indexes, remoteTsAndRef),
    await getAllResourcesOfType(client, ResourceTypes.Role, Roles, remoteTsAndRef),
    await getAllResourcesOfType(client, ResourceTypes.Function, Functions, remoteTsAndRef),
    await getAllResourcesOfType(client, ResourceTypes.AccessProvider, AccessProviders, remoteTsAndRef),
    await getAllResourcesOfType(client, ResourceTypes.Database, Databases, remoteTsAndRef),
  ])
  const categories: any = {}
  for (const item in ResourceTypes) {
    categories[item] = []
  }
  cloudResources.forEach((snippets) => {
    snippets.forEach((s: TaggedExpression) => {
      categories[<string>s.type].push(s)
    })
  })
  return categories
}

// Transform the roles, you don't need ts or ref.
// We need it to be close to what we receive locally and therefore
// remove generated fields.
const remoteTsAndRef = (expr: any) => {
  const clone = cloneDeep(expr)
  delete clone.ts
  delete clone.ref
  return clone
}

const getAllResourcesOfType = async (
  client: fauna.Client,
  type: ResourceTypes,
  fqlFun: any,
  transformFun: Fun
): Promise<any> => {
  const fqlQuery = (cursor: any) =>
    q.Map(Paginate(fqlFun(), { size: batchSize, after: cursor }), Lambda('x', Get(Var('x'))))

  const resources = await getAllResourcesWithFun(client, fqlQuery)
  return resources.map((el: any) => {
    return { name: el.name, jsonData: transformFun(el), type: type }
  })
}

const getAllResourcesWithFun = async (client: fauna.Client, fqlFun: FQLFun): Promise<any> => {
  return await getAllResourcesWithFunRec(client, fqlFun)
}

const getAllResourcesWithFunRec = async (client: fauna.Client, fqlFun: FQLFun, cursor?: any): Promise<any> => {
  const res: any = await client.query(fqlFun(cursor))

  if (res.after) {
    return res.data.concat(await getAllResourcesWithFunRec(client, fqlFun, res.after))
  } else {
    return res.data
  }
}
