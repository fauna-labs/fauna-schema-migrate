import * as fauna from 'faunadb'

const { Update, Delete, Role, Function, Collection, Index, AccessProvider } = fauna.query

import { PlannedDiff, PlannedMigrations, TaggedExpression } from "../types/expressions";
import { writeNewMigration } from '../util/files';
import { ResourceTypes } from '../types/resource-types';
import { prettyPrintExpr } from '../fql/print';


export const writeMigrations = async (migrations: TaggedExpression[]) => {
    writeNewMigration(migrations)
}

export const generateMigrations = async (planned: PlannedMigrations) => {
    const migrExprs: TaggedExpression[][] = []
    // First add all the ones we can generate generically.
    migrExprs.push(getCreateAndDeleteGeneric(planned[ResourceTypes.Role], Role))
    migrExprs.push(getCreateAndDeleteGeneric(planned[ResourceTypes.Function], Function))
    migrExprs.push(getCreateAndDeleteGeneric(planned[ResourceTypes.Collection], Collection))
    migrExprs.push(getCreateAndDeleteGeneric(planned[ResourceTypes.Index], Index))
    migrExprs.push(getCreateAndDeleteGeneric(planned[ResourceTypes.AccessProvider], AccessProvider))

    // Then add the special cases.
    migrExprs.push(getUpdateRoleExpressions(planned[ResourceTypes.Role]))
    migrExprs.push(getUpdateFuncExpressions(planned[ResourceTypes.Function]))
    migrExprs.push(getUpdateCollectionExpressions(planned[ResourceTypes.Collection]))
    // migrExprs.push(getUpdateIndexEpxressions(planned[ResourceTypes.Index], Index))
    // leaving this commented to make it clear that it's not forgotten, updating indexes is not possible.
    migrExprs.push(getUpdateAccessProviderExpressions(planned[ResourceTypes.AccessProvider]))


    const migrExprsFlat = migrExprs.flat()
    migrExprsFlat.forEach((mig) => {
        mig.fqlFormatted = prettyPrintExpr(mig.fqlExpr)
    })
    return migrExprsFlat
}


const getCreateAndDeleteGeneric = (resources: PlannedDiff, fqlFun: any) => {
    let migrExprs: TaggedExpression[] = []
    resources.added.forEach((res) => {
        migrExprs.push(toTaggedExpr(res.current, res.current?.fqlExpr))
    })
    resources.deleted.forEach((res) => {
        migrExprs.push(toTaggedExpr(res.previous, Delete(
            getReference(<TaggedExpression>res.previous, fqlFun),
        )))
    })
    return migrExprs
}

/* Currently keeping them separate forin case there are special cases later on */
const getUpdateAccessProviderExpressions = (accessproviders: PlannedDiff) => {
    let migrExprs: TaggedExpression[] = []
    accessproviders.changed.forEach((ap) => {
        migrExprs.push(toTaggedExpr(ap.current, Update(
            getReference(<TaggedExpression>ap.current, AccessProvider),
            ap.current?.fqlExpr.raw.create_access_provider.raw.object
        )))
    })
    return migrExprs
}

const getUpdateCollectionExpressions = (collections: PlannedDiff) => {
    let migrExprs: TaggedExpression[] = []
    collections.changed.forEach((col) => {
        migrExprs.push(toTaggedExpr(col.current, Update(
            getReference(<TaggedExpression>col.current, Collection),
            col.current?.fqlExpr.raw.create_collection.raw.object
            // {
            //     name: col.current?.fqlExpr.raw.create_collection.raw.object.name,
            //     history_days: col.current?.fqlExpr.raw.create_collection.raw.object.history_days,
            //     ttl_days: col.current?.fqlExpr.raw.create_collection.raw.object.ttl_days,
            //     data: col.current?.fqlExpr.raw.create_collection.raw.object.data,
            // }
        )))
    })
    return migrExprs
}

const getUpdateRoleExpressions = (roles: PlannedDiff) => {
    let migrExprs: TaggedExpression[] = []
    roles.changed.forEach((role) => {
        migrExprs.push(toTaggedExpr(role.current, Update(
            getReference(<TaggedExpression>role.current, Role),
            role.current?.fqlExpr.raw.create_role.raw.object
            // {
            //     privileges: role.current?.fqlExpr.raw.create_role.raw.object.privileges,
            //     membership: role.current?.fqlExpr.raw.create_role.raw.object.membership,
            //     data: role.current?.fqlExpr.raw.create_role.raw.object.data
            // }
        )))
    })
    return migrExprs
}

const getUpdateFuncExpressions = (functions: PlannedDiff) => {
    let migrExprs: TaggedExpression[] = []
    functions.changed.forEach((func) => {
        migrExprs.push(toTaggedExpr(func.current, Update(
            getReference(<TaggedExpression>func.current, Function),
            func.current?.fqlExpr.raw.create_function.raw.object
            // {
            //     body: func.current?.fqlExpr.raw.create_function.raw.object.body,
            //     role: func.current?.fqlExpr.raw.create_function.raw.object.role,
            //     data: func.current?.fqlExpr.raw.create_function.raw.object.data
            // }
        )))
    })
    return migrExprs
}

const getReference = (taggedExpr: TaggedExpression, fqlFunc: any) => {
    return fqlFunc(taggedExpr.name)
}


const toTaggedExpr = (taggedExpr: TaggedExpression | undefined, expr: fauna.Expr) => {
    if (taggedExpr === undefined) {
        throw new Error('toTaggedExpr: received undefined expr')
    }
    else {
        return {
            name: taggedExpr.name,
            type: taggedExpr.type,
            fqlExpr: expr
        }
    }
}


