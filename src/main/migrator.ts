import * as beautify from 'js-beautify'
import * as fauna from 'faunadb'
const { Update, Delete } = fauna.query

import { PlannedDiff, PlannedMigrations, TaggedExpression } from "../types/expressions";
import { writeNewMigration } from '../util/files';


export const writeMigrations = async (planned: PlannedMigrations) => {
    const migrExprs = [
        getRoleExpressions(planned.roles)
    ].flat()

    migrExprs.forEach((mig) => {
        mig.fqlFormatted = prettyPrint(mig.fqlExpr)
    })

    writeNewMigration(migrExprs)
}


const getRoleExpressions = (roles: PlannedDiff) => {
    let migrExprs: TaggedExpression[] = []
    roles.added.forEach((role) => {
        console.log(role.local)
        migrExprs.push(toTaggedExpr(role.local, role.local?.fqlExpr))
    })

    roles.changed.forEach((role) => {
        migrExprs.push(toTaggedExpr(role.local, Update(
            role.remote?.json.ref,
            { privileges: role.local?.fqlExpr.raw.create_role.raw.object.privileges }
        )))
    })

    roles.deleted.forEach((role) => {
        migrExprs.push(toTaggedExpr(role.remote, Delete(
            role.remote?.json.ref,
        )))
    })

    return migrExprs
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
