
var cloneDeep = require('lodash.clonedeep')

import * as fauna from 'faunadb'
import { toJsonDeep } from '../fql/json'
import { LoadedResources, TaggedExpression } from '../types/expressions'
import { ResourceTypes } from '../types/resource-types'
import { getClient } from '../util/fauna-client'
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
    AccessProviders
} = q

type Fun = (n: any) => any
type FQLFun = (n: any) => fauna.Expr

const batchSize = 100



export const getAllCloudResources = async (): Promise<LoadedResources> => {
    // TODO, I should split up types from Cloud from other resources since
    // they are quite different.
    const cloudResources = await Promise.all([
        // TODO, add other types!
        await getAllResourcesOfType(ResourceTypes.Role, GetRolesFQL, remoteTsAndRef),
        await getAllResourcesOfType(ResourceTypes.Function, GetFunctionsFQL, remoteTsAndRef)]
    )
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


const GetCollectionsFQL = (cursor: any) =>
    q.Map(Paginate(Collections(), { size: batchSize, after: cursor }), Lambda('x', Get(Var('x'))))

const GetIndexesFQL = (cursor: any) =>
    q.Map(Paginate(Indexes(), { size: batchSize, after: cursor }), Lambda('x', Get(Var('x'))))

const GetDatabasesFQL = (cursor: any) =>
    q.Map(Paginate(Databases(), { size: batchSize, after: cursor }), Lambda('x', Get(Var('x'))))

const GetRolesFQL = (cursor: any) =>
    q.Map(Paginate(Roles(), { size: batchSize, after: cursor }), Lambda('x', Get(Var('x'))))

const GetFunctionsFQL = (cursor: any) =>
    q.Map(Paginate(Functions(), { size: batchSize, after: cursor }), Lambda('x', Get(Var('x'))))

const GetAccessProviders = (cursor: any) =>
    q.Map(Paginate(AccessProviders(), { size: batchSize, after: cursor }), Lambda('x', Get(Var('x'))))


const getAllResourcesOfType = async (type: ResourceTypes, fqlFun: FQLFun, transformFun: Fun): Promise<any> => {
    const resources = await getAllResourcesWithFun(fqlFun)
    return resources.map((el: any) => {
        const json = toJsonDeep(el)
        return { json: json, name: el.name, jsonData: transformFun(json), type: type }
    })
}

const getAllResourcesWithFun = async (fqlFun: FQLFun): Promise<any> => {
    const client = getClient()
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