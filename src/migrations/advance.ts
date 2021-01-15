
import { getAllLastMigrationSnippets, getSnippetsFromNextMigration } from "../state/from-migration-files"
import { LoadedResources, MigrationRefAndTimestamp, StatementType, TaggedExpression, RollbackTargetCurrentAndSkippedMigrations as RollbackTargetCurrentAndSkippedMigrations, ApplyTargetCurrentAndSkippedMigrations } from "../types/expressions"
import { ResourceTypes } from "../types/resource-types"

import * as fauna from 'faunadb'

import { config } from '../util/config';
import { retrieveAllCloudMigrations, retrieveLastCloudMigration } from "../fql/fql-snippets"
import { generateMigrationQuery } from "./generate-query"
import { transformUpdateToUpdate } from "../fql/transform";
import { retrieveAllMigrations } from "../util/files";
import { retrieveDiffBetweenResourcesAndMigrations } from "./plan";

const q = fauna.query
const { Let, Create, Collection, Lambda } = q

export interface NameToDependencyNames {
    [type: string]: string[]
}

export interface NameToExpressions {
    [type: string]: TaggedExpression
}
export interface NameToBool {
    [type: string]: boolean
}

export interface NameToVar {
    [type: string]: string
}

export interface DependenciesArrayEl {
    indexedName: string,
    dependencyIndexNames: string[]
}

export const retrieveMigrationInfo = async (client: fauna.Client) => {
    const allCloudMigrations = (await retrieveAllCloudMigrations(client))
    const allLocalMigrations = await retrieveAllMigrations()
    return {
        allCloudMigrations: allCloudMigrations,
        allLocalMigrations: allLocalMigrations
    }
}


export const getCurrentAndTargetMigration = async (
    localMigrations: string[],
    cloudMigrations: MigrationRefAndTimestamp[],
    amount: number): Promise<ApplyTargetCurrentAndSkippedMigrations> => {

    // Retrieve all migration timestamps that have been processed from cloud
    // get the migration timestmap we are currently at.
    const currentMigration = cloudMigrations.length > 0 ? cloudMigrations[cloudMigrations.length - 1] : null
    const applyToIndex = (cloudMigrations.length - 1) + amount

    const targetMigration = applyToIndex < localMigrations.length ? localMigrations[applyToIndex] : null

    if (!targetMigration) {
        throw new Error('Asked for apply but there are no migrations to apply anymore')
    }
    const skippedMigrations = localMigrations.slice(cloudMigrations.length, applyToIndex)
    return { current: currentMigration, target: targetMigration, skipped: skippedMigrations }
}

export const retrieveDiff = async (currentMigration: null | MigrationRefAndTimestamp, targetMigration: string) => {
    const appliedMigrations = await getAppliedMigrations(currentMigration)

    const { migrations: toApplyMigrations }
        = await getAllLastMigrationSnippets(targetMigration)

    const diff = retrieveDiffBetweenResourcesAndMigrations(appliedMigrations, toApplyMigrations)
    return diff
}

const getAppliedMigrations = async (currentMigration: MigrationRefAndTimestamp | null) => {
    if (currentMigration) {
        const { migrations: currentMigrations }
            = await getAllLastMigrationSnippets(currentMigration.timestamp)
        return currentMigrations
    }
    else {
        const categories: any = {}
        for (let item in ResourceTypes) {
            categories[item] = []
        }
        return categories
    }
}

export const generateApplyQuery = async (
    expressions: TaggedExpression[],
    skippedMigrations: string[],
    targetMigration: string) => {

    expressions = fixUpdates(expressions)
    const letQueryObject = await generateMigrationQuery(expressions)
    const migrCollection = await config.getMigrationCollection()
    const migrationCreateStatements = skippedMigrations.concat([targetMigration])
    const query = Let(
        // add all statements as Let variable bindings
        letQueryObject,
        // add the migration documents
        q.Map(
            migrationCreateStatements,
            Lambda(migration => Create(
                Collection(migrCollection),
                { data: { migration: migration } })))

    )

    return query
}

const getMigrationMetadata = (migrationcategories: LoadedResources) => {
    const migrationMetaData: any = {}
    Object.keys(migrationcategories).forEach((key) => {
        const migrations = migrationcategories[key]
        const metadata = migrations.map((m) => {
            return {
                name: m.name, type: m.type
            }
        })
        migrationMetaData[key] = metadata
    })
    return migrationMetaData
}

const flattenMigrations = (migrationsPerType: LoadedResources) => {
    const grouped: TaggedExpression[][] = []
    Object.keys(migrationsPerType).forEach((typeStr: string) => {
        const type = ResourceTypes[typeStr as keyof typeof ResourceTypes]
        const migrations = migrationsPerType[type]
        grouped.push(migrations)

    })
    const flattened = grouped.flat()
    return flattened
}

// Updates only update the explicitely mentioned keys. To be certain
// we have to fill in all the keys for a given type with key: null.
const fixUpdates = (expressions: TaggedExpression[]) => {
    return expressions.map((e) => {
        if (e.statement === StatementType.Update) {
            return transformUpdateToUpdate(e)
        }
        else {
            return e
        }
    })
}

