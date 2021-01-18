
var cloneDeep = require('lodash.clonedeep')

import * as fauna from 'faunadb'
import { toJsonDeep } from '../fql/json'
import { LoadedResources, TaggedExpression } from '../types/expressions'
import { ResourceTypes } from '../types/resource-types'
import { MigrationRefAndTimestamp } from '../types/expressions'
import { config } from '../util/config'

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
    Select
} = q

type Fun = (n: any) => any
type FQLFun = (n: any) => fauna.Expr

const batchSize = 100

const createQuery = (name: string) =>
    CreateCollection({ name: name })

const wrapInCrate = (fetchQuery: any, name: string) => {
    return If(
        Exists(Collection(name)),
        fetchQuery(Collection(name)),
        Let({
            col: createQuery(name),
            ref: Select(['ref'], Var('col'))
        },
            fetchQuery(Var('ref'))
        )
    )
}

export const createMigrationCollection = async (client: fauna.Client) => {
    const name = await config.getMigrationCollection()
    return await client.query(
        If(
            Exists(Collection(name)),
            false,
            CreateCollection({ name: await config.getMigrationCollection() })
        ))
}

export const retrieveLastCloudMigration = async (client: fauna.Client) => {
    const name = await config.getMigrationCollection()
    const fetchQuery = (collectionRef: any) => Let(
        {
            setref: Reverse(Documents(collectionRef))
        },
        If(Exists(Var('setref')), Get(Var('setref')), null)
    )
    const res: any = await client.query(
        wrapInCrate(fetchQuery, name)
    )
    return res ? res.data.migration : res
}

export const retrieveAllCloudMigrations = async (client: fauna.Client): Promise<MigrationRefAndTimestamp[]> => {
    const name = await config.getMigrationCollection()
    const fetchQuery = (collectionRef: any) => Let(
        {
            setref: Documents(collectionRef)
        },
        q.Map(
            Paginate(Var('setref'), { size: 10000 }),
            Lambda(x => Get(x)))
    )
    const res: any = await client.query(
        wrapInCrate(fetchQuery, name)
    )
    // we only need the timestamps and refs
    return res ? res.data.map((e: any) => {
        return {
            timestamp: e.data.migration,
            ref: e.ref
        }
    }) : res
}

export const getAllCloudResources = async (client: fauna.Client): Promise<LoadedResources> => {
    const cloudResources = await Promise.all([
        await getAllResourcesOfType(client, ResourceTypes.Collection, Collections, remoteTsAndRef),
        await getAllResourcesOfType(client, ResourceTypes.Index, Indexes, remoteTsAndRef),
        await getAllResourcesOfType(client, ResourceTypes.Role, Roles, remoteTsAndRef),
        await getAllResourcesOfType(client, ResourceTypes.Function, Functions, remoteTsAndRef),
        await getAllResourcesOfType(client, ResourceTypes.AccessProvider, AccessProviders, remoteTsAndRef),
        await getAllResourcesOfType(client, ResourceTypes.Database, Databases, remoteTsAndRef)

    ])
    const categories: any = {}
    for (let item in ResourceTypes) {
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
const remoteTsAndRef = (json: any) => {
    const clone = cloneDeep(json)
    delete clone.ts
    delete clone.ref
    return clone
}

const getAllResourcesOfType = async (client: fauna.Client, type: ResourceTypes, fqlFun: any, transformFun: Fun): Promise<any> => {
    const fqlQuery = (cursor: any) => q.Map(
        Paginate(fqlFun(), { size: batchSize, after: cursor }),
        Lambda('x', Get(Var('x'))))

    const resources = await getAllResourcesWithFun(client, fqlQuery)
    return resources.map((el: any) => {
        const json = toJsonDeep(el)
        return { json: json, name: el.name, jsonData: transformFun(json), type: type }
    })
}

const getAllResourcesWithFun = async (client: fauna.Client, fqlFun: FQLFun): Promise<any> => {
    return await getAllResourcesWithFunRec(client, fqlFun)
}

const getAllResourcesWithFunRec = async (client: fauna.Client, fqlFun: FQLFun, cursor?: any): Promise<any> => {
    const res: any = await client.query(fqlFun(cursor))

    if (res.after) {
        return res.data.concat(await getAllResourcesWithFunRec(client, fqlFun, res.after))
    }
    else {
        return res.data
    }
}