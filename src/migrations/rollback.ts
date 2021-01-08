import * as fauna from 'faunadb'

import { clientGenerator } from "../util/fauna-client"
import { getAllLastMigrationSnippets } from "../state/from-migration-files"
import { retrieveAllCloudMigrations } from "../fql/fql-snippets"
import { ResourceTypes } from '../types/resource-types'
import { MigrationRefAndTimestamp, PlannedMigrations, StatementType, TaggedExpression, TargetCurrentAndSkippedMigrations } from '../types/expressions'
import { retrieveDiffBetweenResourcesAndMigrations } from './plan'
import { transformCreateToDelete, transformCreateToUpdate, transformUpdateToCreate, transformUpdateToDelete, transformUpdateToUpdate } from '../fql/transform'
import { prettyPrintExpr } from '../fql/print'
import { generateMigrationQuery } from './apply'

const q = fauna.query
const { Let, Lambda, Delete } = fauna.query

export const rollbackMigrations = async (amount: number) => {
    const client = clientGenerator.getClient()
    const { current: currentMigration, target: targetMigration, skipped: skippedMigrations }
        = await getCurrentAndTargetMigration(amount)
    const diff = await retrieveDiff(currentMigration, targetMigration)
    const expressions = transformDiffToExpressions(diff)
    const letQueryObject = await generateMigrationQuery(expressions)
    const toDeleteReferences = skippedMigrations.concat([currentMigration])
        .map((e) => e.ref)
    const query = Let(
        // add all statements as Let variable bindings
        letQueryObject,
        q.Map(toDeleteReferences, Lambda(ref => Delete(ref)))
    )

    console.log('----- rollback query')
    // Todo: prettyprint query in case of verbose option, add that option.
    //       or a 'plan' option to see the query.
    console.log(' Pretty printed FQL Result \n ---------------- ', prettyPrintExpr(query))
    await client.query(query)
}

const getCurrentAndTargetMigration = async (amount: number): Promise<TargetCurrentAndSkippedMigrations> => {
    const client = clientGenerator.getClient()
    // Retrieve all migration timestamps that have been processed from cloud
    const cloudMigrations = (await retrieveAllCloudMigrations(client)).sort()
    // get the migration timestmap we are currently at.
    const currentMigration = cloudMigrations.length > 0 ? cloudMigrations[cloudMigrations.length - 1] : null
    if (!currentMigration) {
        throw new Error('Asked for rollback but the target database has no migrations')
    }
    // get the migration timestamp we we want to roll back to.
    const rollbackToIndex = cloudMigrations.length - 1 - amount
    const targetMigration = rollbackToIndex < cloudMigrations.length ? cloudMigrations[rollbackToIndex] : null
    if (!targetMigration) {
        throw new Error('Asked for rollback that goes back further than the first migration')
    }
    const skippedMigrations = cloudMigrations.slice(rollbackToIndex + 1, cloudMigrations.length - 1)
    return { current: currentMigration, target: targetMigration, skipped: skippedMigrations }
}

const retrieveDiff = async (currentMigration: MigrationRefAndTimestamp, targetMigration: MigrationRefAndTimestamp) => {
    if (targetMigration === null) {
        console.log('todo, this basically is nuking the whole database, delete ALL the things')
        throw new Error("todo")
    }
    else {
        const { migrations: currentMigrations, lastMigration: currentLastMigration }
            = await getAllLastMigrationSnippets(currentMigration.timestamp)
        const { migrations: previousMigrations, lastMigration: previousLastMigration }
            = await getAllLastMigrationSnippets(targetMigration.timestamp)
        // just to be clear these vars should be the same.
        if (previousLastMigration !== targetMigration.timestamp) {
            throw Error(`did not receive the same migration,
                rollbackMigration should be equal to previousLastMigration
                ${previousLastMigration}, ${targetMigration.timestamp}
            `)
        }
        // We need to calculate the diff. But we already have such a function
        // which we used to plan migrations.
        // we can consider the previousMigrations as the new source of truth (we have to go there)
        // while currentMigrations is the migration state we have to move forward from.
        // or in this case backward since it's a rollback.
        // In essence, previousMigrations is equivalent to the 'resources' now
        // while currentMigrations are the 'migrations'.
        const diff = retrieveDiffBetweenResourcesAndMigrations(currentMigrations, previousMigrations)
        console.log(diff)
        return diff
    }
}


const transformDiffToExpressions = (diff: PlannedMigrations): TaggedExpression[] => {
    const expressions: TaggedExpression[] = []
    for (let resourceType in ResourceTypes) {
        const diffForType = diff[resourceType]
        diffForType.added.map((prevCurr) => {
            if (prevCurr.target?.statement === StatementType.Update) {
                expressions.push(transformUpdateToCreate(prevCurr.target))
            }
            else if (prevCurr.target?.statement === StatementType.Create) {
                expressions.push(prevCurr.target)
            }
            else {
                console.log(prevCurr.target)
                throw Error(`Unexpected type in rollback ${prevCurr.target?.statement}`)
            }
        })

        diffForType.changed.map((prevCurr) => {
            // CHANGED
            // changed in rollback means that the migrations we are rolling back did an update.
            // The previous statement can be both a Create as an Update and since the resource
            // already exists it needs to be trasnformed to an Update.
            if (prevCurr.target?.statement === StatementType.Update) {
                // if it's an update, keep it
                expressions.push(transformUpdateToUpdate(prevCurr.target))
            }
            else if (prevCurr.target?.statement === StatementType.Create) {
                // if it's a create. trasnform to an update.
                expressions.push(transformCreateToUpdate(prevCurr.target))
            }
            else {
                throw Error(`Unexpected type in rollback ${prevCurr.target?.statement}`)
            }

        })

        diffForType.deleted.map((prevCurr) => {
            // ADDED
            // deleted in rollback means that the migrations we are rolling back added a resource.
            // The previous statement should therefore be a CREATE or UDPATE statement and
            // the current will not exist. We need to replace it with a DELETE
            if (prevCurr.previous?.statement === StatementType.Update) {
                // if it's an update, keep it
                expressions.push(transformCreateToDelete(prevCurr.previous))
            }
            else if (prevCurr.previous?.statement === StatementType.Create) {
                // if it's a create. trasnform to an update.
                expressions.push(transformUpdateToDelete(prevCurr.previous))
            }
            else {
                console.log(prevCurr.target)
                throw Error(`Unexpected type in rollback ${prevCurr.target?.statement}`)
            }
        })
    }
    return expressions
}