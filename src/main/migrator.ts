import * as beautify from 'js-beautify'
import * as fauna from 'faunadb'

const { Update, Delete, Role, Function } = fauna.query

import { PlannedDiff, PlannedMigrations, TaggedExpression } from "../types/expressions";
import { writeNewMigration } from '../util/files';
import { ResourceTypes } from '../types/resource-types';


export const writeMigrations = async (planned: PlannedMigrations) => {
    const migrExprs = [
        getCreateAndDeleteGeneric(planned[ResourceTypes.Role]),
        getCreateAndDeleteGeneric(planned[ResourceTypes.Function]),
        getUpdateRoleExpressions(planned[ResourceTypes.Role]),
        getUpdateFuncExpressions(planned[ResourceTypes.Function])
    ].flat()

    migrExprs.forEach((mig) => {
        mig.fqlFormatted = prettyPrint(mig.fqlExpr)
    })

    // TODO order migrations based on dependencies
    const orderedMigrExprs = orderMigrations(migrExprs)
    writeNewMigration(migrExprs)
}

const orderMigrations = (expressions: TaggedExpression[]) => {
    // Todo, order them, build dependency tree.
}

const getCreateAndDeleteGeneric = (resources: PlannedDiff) => {
    let migrExprs: TaggedExpression[] = []
    resources.added.forEach((res) => {
        migrExprs.push(toTaggedExpr(res.current, res.current?.fqlExpr))
    })
    resources.deleted.forEach((res) => {
        migrExprs.push(toTaggedExpr(res.previous, Delete(
            getReference(<TaggedExpression>res.previous, Role),
        )))
    })
    return migrExprs
}


const getUpdateRoleExpressions = (roles: PlannedDiff) => {
    let migrExprs: TaggedExpression[] = []
    roles.changed.forEach((role) => {
        migrExprs.push(toTaggedExpr(role.current, Update(
            getReference(<TaggedExpression>role.current, Role),
            { privileges: role.current?.fqlExpr.raw.create_role.raw.object.privileges }
        )))
    })
    return migrExprs
}

const getUpdateFuncExpressions = (functions: PlannedDiff) => {
    let migrExprs: TaggedExpression[] = []
    functions.changed.forEach((func) => {
        migrExprs.push(toTaggedExpr(func.current, Update(
            getReference(<TaggedExpression>func.current, Function),
            {
                body: func.current?.fqlExpr.raw.create_function.raw.object.body,
                role: func.current?.fqlExpr.raw.create_function.raw.object.role
            }
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


const prettyPrint = (expr: any) => {
    return beautify.js(expr.toFQL(), { indent_size: 2, keep_array_indentation: true })
}
