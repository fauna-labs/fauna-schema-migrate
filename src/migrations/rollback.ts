import * as fauna from 'faunadb'

import { clientGenerator } from "../util/fauna-client"
import { getAllLastMigrationSnippets } from "../state/from-migration-files"
import { ResourceTypes } from '../types/resource-types'
import { LoadedResources, MigrationRefAndTimestamp, PlannedDiffPerResource, StatementType, TaggedExpression, RollbackTargetCurrentAndSkippedMigrations } from '../types/expressions'
import { generateMigrationQuery } from './generate-query'
import { retrieveAllMigrations } from '../util/files'
import { retrieveDiff } from './diff'

const q = fauna.query
const { Let, Lambda, Delete } = fauna.query

export const retrieveRollbackMigrations = async (
    cloudMigrations: MigrationRefAndTimestamp[],
    amount: number,
    atChildDbPath: string[]) => {

    const allMigrations = await retrieveAllMigrations(atChildDbPath)
    const res = await getCurrentAndTargetMigration(cloudMigrations, amount)
    return { allLocalMigrations: allMigrations, toRollback: res }
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


const getCurrentAndTargetMigration = async (cloudMigrations: MigrationRefAndTimestamp[], amount: number): Promise<RollbackTargetCurrentAndSkippedMigrations> => {
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

export const retrieveDiffCurrentTarget = async (
    currentMigration: MigrationRefAndTimestamp,
    targetMigration: null | MigrationRefAndTimestamp, atChildPath: string[]) => {

    const { migrations: currentMigrations, lastMigration: currentLastMigration }
        = await getAllLastMigrationSnippets(atChildPath, currentMigration.timestamp)

    const targetMigrations = await getTargetMigrations(targetMigration, atChildPath)

    // We need to calculate the diff. But we already have such a function
    // which we used to plan migrations.
    // we can consider the previousMigrations as the new source of truth (we have to go there)
    // while currentMigrations is the migration state we have to move forward from.
    // or in this case backward since it's a rollback.
    // In essence, previousMigrations is equivalent to the 'resources' now
    // while currentMigrations are the 'migrations'.
    const diff = retrieveDiff(currentMigrations, targetMigrations)
    return diff
}

const getTargetMigrations = async (targetMigration: MigrationRefAndTimestamp | null, atChildPath: string[]): Promise<LoadedResources> => {
    if (targetMigration) {
        const { migrations: previousMigrations, lastMigration: previousLastMigration }
            = await getAllLastMigrationSnippets(atChildPath, targetMigration.timestamp)
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
