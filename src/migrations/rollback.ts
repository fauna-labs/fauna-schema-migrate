import * as fauna from 'faunadb'

import { clientGenerator } from "../util/fauna-client"
import { getAllLastMigrationSnippets } from "../state/from-migration-files"
import { retrieveAllCloudMigrations } from "../fql/fql-snippets"
import { ResourceTypes } from '../types/resource-types'
import { LoadedResources, MigrationRefAndTimestamp, PlannedMigrations, StatementType, TaggedExpression, TargetCurrentAndSkippedMigrations } from '../types/expressions'
import { retrieveDiffBetweenResourcesAndMigrations } from './plan'
import { transformCreateToDelete, transformCreateToUpdate, transformUpdateToCreate, transformUpdateToDelete, transformUpdateToUpdate } from '../fql/transform'
import { prettyPrintExpr } from '../fql/print'
import { generateMigrationQuery } from './generate-query'
import { interactiveShell } from '../interactive-shell/interactive-shell'
import { retrieveAllMigrations } from '../util/files'

const q = fauna.query
const { Let, Lambda, Delete } = fauna.query

export const retrieveRollbackMigrations = async (client: fauna.Client, amount: number) => {
    const cloudMigrations = (await retrieveAllCloudMigrations(client)).sort()
    const allMigrations = await retrieveAllMigrations()
    const res = await getCurrentAndTargetMigration(cloudMigrations, amount)
    return { allMigrations: allMigrations, toRollback: res }
}

export const generateRollbackQuery = async (
    expressions: TaggedExpression[],
    skippedMigrations: MigrationRefAndTimestamp[],
    currentMigration: MigrationRefAndTimestamp) => {

    const letQueryObject = await generateMigrationQuery(expressions)
    const toDeleteReferences = skippedMigrations.concat([currentMigration])
        .map((e) => e.ref)
    const query = Let(
        // add all statements as Let variable bindings
        letQueryObject,
        q.Map(toDeleteReferences, Lambda(ref => Delete(ref)))
    )
    return query
}


const getCurrentAndTargetMigration = async (cloudMigrations: MigrationRefAndTimestamp[], amount: number): Promise<TargetCurrentAndSkippedMigrations> => {
    const client = await clientGenerator.getClient()
    // Retrieve all migration timestamps that have been processed from cloud
    // get the migration timestmap we are currently at.
    const currentMigration = cloudMigrations.length > 0 ? cloudMigrations[cloudMigrations.length - 1] : null
    if (amount > cloudMigrations.length || !currentMigration) {
        throw new Error('Asked for rollback but the target database has no migrations')
    }
    // get the migration timestamp we we want to roll back to.
    const rollbackToIndex = cloudMigrations.length - 1 - amount
    const targetMigration = rollbackToIndex < cloudMigrations.length ? cloudMigrations[rollbackToIndex] : null
    const skippedMigrations = cloudMigrations.slice(rollbackToIndex + 1, cloudMigrations.length - 1)
    return { current: currentMigration, target: targetMigration, skipped: skippedMigrations }
}

export const retrieveDiff = async (currentMigration: MigrationRefAndTimestamp, targetMigration: null | MigrationRefAndTimestamp) => {
    const { migrations: currentMigrations, lastMigration: currentLastMigration }
        = await getAllLastMigrationSnippets(currentMigration.timestamp)

    const previousMigrations = await getTargetMigrations(targetMigration)

    // We need to calculate the diff. But we already have such a function
    // which we used to plan migrations.
    // we can consider the previousMigrations as the new source of truth (we have to go there)
    // while currentMigrations is the migration state we have to move forward from.
    // or in this case backward since it's a rollback.
    // In essence, previousMigrations is equivalent to the 'resources' now
    // while currentMigrations are the 'migrations'.
    const diff = retrieveDiffBetweenResourcesAndMigrations(currentMigrations, previousMigrations)
    return diff
}

const getTargetMigrations = async (targetMigration: MigrationRefAndTimestamp | null): Promise<LoadedResources> => {
    if (targetMigration) {
        const { migrations: previousMigrations, lastMigration: previousLastMigration }
            = await getAllLastMigrationSnippets(targetMigration.timestamp)
        // just to be clear these vars should be the same.
        if (previousLastMigration !== targetMigration.timestamp) {
            throw Error(`did not receive the same migration,
                    rollbackMigration should be equal to previousLastMigration
                    ${previousLastMigration}, ${targetMigration.timestamp}
                `)
        }
        return previousMigrations
    }
    else {
        const categories: any = {}
        for (let item in ResourceTypes) {
            categories[item] = []
        }
        return categories
    }
}


export const transformDiffToExpressions = (diff: PlannedMigrations): TaggedExpression[] => {
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