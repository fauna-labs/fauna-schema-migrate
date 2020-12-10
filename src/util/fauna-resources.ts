
var cloneDeep = require('lodash.clonedeep')

import * as fauna from 'faunadb'
import { LoadedResources } from '../types/expressions'
import { getClient } from './fauna-client'
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



export const getAllResources = async (): Promise<LoadedResources> => {
    const collections: any[] = []
    const indexes: any[] = []
    const databases: any[] = []
    const functions: any[] = []
    const accessproviders: any[] = []

    // const collections = await getAllResourcesOfType(GetCollectionsFQL)
    // const indexes = await getAllResourcesOfType(GetIndexesFQL)
    // const databases = await getAllResourcesOfType(GetDatabasesFQL)
    const roles = await getAllResourcesOfType(GetRolesFQL, removeGeneratedRoleData)
    // const functions = await getAllResourcesOfType(GetFunctionsFQL)
    // const accessproviders = await getAllResourcesWithFun(GetAccessProviders)
    return {
        collections: collections || [],
        indexes: indexes || [],
        databases: databases || [],
        roles: roles || [],
        functions: functions || [],
        accessproviders: accessproviders || []
    }
}

// Transform the roles, you don't need ts or ref.
// We need it to be close to what we receive locally and therefore
// remove generated fields.
const removeGeneratedRoleData = (json: any) => {
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


const getAllResourcesOfType = async (fqlFun: FQLFun, transformFun: Fun): Promise<any> => {
    const resources = await getAllResourcesWithFun(fqlFun)
    return resources.map((el: any) => {
        return { json: el, name: el.name, jsonData: transformFun(el) }
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