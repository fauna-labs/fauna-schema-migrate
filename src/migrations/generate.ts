import * as fauna from 'faunadb'

import { PlannedDiff, PlannedMigrations, TaggedExpression } from "../types/expressions";
import { writeNewMigration } from '../util/files';
import { ResourceTypes } from '../types/resource-types';
import { prettyPrintExpr } from '../fql/print';
import { toTaggedExpr, transformCreateToDelete, transformCreateToUpdate } from '../fql/transform';


export const writeMigrations = async (migrations: TaggedExpression[]) => {
    writeNewMigration(migrations)
}

export const generateMigrations = async (planned: PlannedMigrations) => {
    const migrExprs: TaggedExpression[][] = []
    // First add all the ones we can generate generically.
    migrExprs.push(transformStatements(planned[ResourceTypes.Role]))
    migrExprs.push(transformStatements(planned[ResourceTypes.Function]))
    migrExprs.push(transformStatements(planned[ResourceTypes.Collection]))
    migrExprs.push(transformStatements(planned[ResourceTypes.Index]))
    migrExprs.push(transformStatements(planned[ResourceTypes.AccessProvider]))

    const migrExprsFlat = migrExprs.flat()
    migrExprsFlat.forEach((mig) => {
        mig.fqlFormatted = prettyPrintExpr(mig.fqlExpr)
    })
    return migrExprsFlat
}


const transformStatements = (resources: PlannedDiff,) => {
    let migrExprs: TaggedExpression[] = []
    resources.added.forEach((res) => {
        migrExprs.push(toTaggedExpr(res.target, res.target?.fqlExpr))
    })
    resources.changed.forEach((res) => {
        // indexes can't be updated.
        if (res.target?.type !== ResourceTypes.Index && res.target) {
            migrExprs.push(transformCreateToUpdate(res.target))
        }
    })
    resources.deleted.forEach((res) => {
        if (res.previous) {
            migrExprs.push(transformCreateToDelete(res.previous))
        }
    })
    return migrExprs
}


