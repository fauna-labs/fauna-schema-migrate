
import { getSnippetsFromNextMigration } from "../state/from-migration-files"
import { LoadedResources, TaggedExpression } from "../types/expressions"
import { ResourceTypes } from "../types/resource-types"

import * as fauna from 'faunadb'

import { config } from '../util/config';
import { retrieveLastCloudMigration } from "../fql/fql-snippets"
import { generateMigrationQuery } from "./apply"
import { clientGenerator } from "../util/fauna-client";
import { prettyPrintExpr } from "../fql/print";

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


export const advanceMigrations = async () => {
    const client = clientGenerator.getClient()
    const lastCloudMigration = await retrieveLastCloudMigration(client)
    const migrationsFQL = await getSnippetsFromNextMigration(lastCloudMigration)
    const flattenedMigrations = flattenMigrations(migrationsFQL.categories)
    const letQueryObject = await generateMigrationQuery(client, flattenedMigrations)
    const query = Let(
        // add all statements as Let variable bindings
        letQueryObject,
        // add the migration metadata
        Create(Collection(await config.getMigrationCollection()),
            { data: { migration: migrationsFQL.migration, migrated: getMigrationMetadata(migrationsFQL.categories) } }
        ))

    // Todo: prettyprint query in case of verbose option, add that option.
    //       or a 'plan' option to see the query.
    console.log(' Pretty printed FQL Result \n ---------------- ', prettyPrintExpr(query))
    await client.query(query)
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
