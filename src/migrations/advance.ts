
import { getSnippetsFromNextMigration } from "../state/from-migration-files"
import { LoadedResources, StatementType, TaggedExpression } from "../types/expressions"
import { ResourceTypes } from "../types/resource-types"

import * as fauna from 'faunadb'

import { config } from '../util/config';
import { retrieveLastCloudMigration } from "../fql/fql-snippets"
import { generateMigrationQuery } from "./generate-query"
import { transformUpdateToUpdate } from "../fql/transform";
import { retrieveAllMigrations } from "../util/files";

const { Let, Create, Collection } = fauna.query

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

export const retrieveNextMigration = async (client: fauna.Client) => {
    const lastCloudMigration = await retrieveLastCloudMigration(client)
    const allMigrations = await retrieveAllMigrations()
    return {
        lastCloudMigration: lastCloudMigration,
        allMigrations: allMigrations
    }
}

export const verifyLastMigration = (lastCloudMigration: string, allMigrations: string[]): boolean => {
    return (lastCloudMigration !== allMigrations[allMigrations.length - 1])
}

export const generateMigrations = async (lastCloudMigration: string) => {
    const migrationSnippets = await getSnippetsFromNextMigration(lastCloudMigration)
    let flattenedMigrations = flattenMigrations(migrationSnippets.categories)
    flattenedMigrations = fixUpdates(flattenedMigrations)
    const letQueryObject = await generateMigrationQuery(flattenedMigrations)
    const migrationMetadata = { migration: migrationSnippets.migration, migrated: getMigrationMetadata(migrationSnippets.categories) }
    const query = Let(
        // add all statements as Let variable bindings
        letQueryObject,
        // add the migration metadata
        Create(Collection(await config.getMigrationCollection()),
            { data: migrationMetadata }
        ))

    return { query: query, fqlStatement: letQueryObject, migrationMetadata: migrationMetadata }
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
