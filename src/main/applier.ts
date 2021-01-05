import { CircularMigrationError } from "../errors/CircularMigrationError"
import { findPattern } from "../fql/json"
import { getSnippetsFromNextMigration } from "../state/from-migration-files"
import { LoadedResources, TaggedExpression } from "../types/expressions"
import { PatternAndIndexName } from "../types/patterns"
import { ResourceTypes } from "../types/resource-types"
import { toIndexableName } from "../util"

import * as fauna from 'faunadb'
import { clientGenerator } from "../util/fauna-client"
import { evalFQLCode } from "../fql/eval"
import { config } from '../util/config';
import { retrieveMigrations } from "../fql/snippets"
import { prettyPrintExpr } from '../fql/print';

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


export const applyMigrations = async () => {
    const client = clientGenerator.getClient()
    const lastCloudMigration = await retrieveMigrations(client)
    const migrationsFQL = await getSnippetsFromNextMigration(lastCloudMigration)
    const flattenedMigrations = flattenMigrations(migrationsFQL.categories)
    const indexedMigrations = indexMigrations(flattenedMigrations)
    const dependencyIndex = findDependencies(flattenedMigrations)
    // transform index to sorted array, sorted on amount of dependencies.
    // since we can safely start with the ones that don't have dependencies
    const dependenciesArray = indexToDependenciesArray(dependencyIndex)
    // Todo, add names of previous migrations for extra verification
    // to make sure no unexisting resource is deleted/updated.
    const namesPresent: NameToBool = {}
    const orderedExpressions = []
    let popLength = 0

    while (dependenciesArray.length > 0) {
        // if popLength becomes to big we have been around the complete array which means 
        // that we are running in circles (there are circular dependencies that can't)
        // be resolved
        if (popLength >= dependenciesArray.length) {
            throw new CircularMigrationError(dependenciesArray.map((e) => indexedMigrations[e.indexedName]))
        }
        const dep = <DependenciesArrayEl>dependenciesArray.shift()
        popLength++
        const allDepsPresent = dep?.dependencyIndexNames.every((el) => namesPresent[el])
        if (allDepsPresent) {
            namesPresent[dep.indexedName] = true
            orderedExpressions.push(indexedMigrations[dep.indexedName])
            popLength = 0
        }
        // else, push to end, first handle others
        else {
            dependenciesArray.push(dep)
        }
    }

    const nameTOVar: NameToVar = {}
    try {
        const obj: any = {}
        orderedExpressions.forEach((e, varIndex) => {
            const indexableName = toIndexableName(e)
            const dependencies = dependencyIndex[indexableName]
            dependencies.forEach((dep: string) => {
                const depExpr = indexedMigrations[dep]
                const depIndexableName = toIndexableName(depExpr)
                // Todo, currently done via the string which is probably
                // a silly inefficient way to do it (but easier).
                // Might want to change this and do an expression manipulation
                // instead directly.
                e.fql = replaceAll(
                    <string>e.fql,
                    `${depExpr.type}("${depExpr.name}")`,
                    `Select(['ref'],Var("${nameTOVar[depIndexableName]}"))`)
                e.fql = replaceAll(
                    <string>e.fql,
                    `${depExpr.type}('${depExpr.name}')`,
                    `Select(['ref'], Var("${nameTOVar[depIndexableName]}"))`)
            })
            nameTOVar[indexableName] = `var${varIndex}`
            obj[`var${varIndex}`] = evalFQLCode(<string>e.fql)
        })
        const query = Let(obj,
            // At the end of the let we'll create the migration.
            Create(Collection(await config.getMigrationCollection()),
                { data: { migration: migrationsFQL.migration, migrated: getMigrationMetadata(migrationsFQL.categories) } }
            ))

        // Todo: prettyprint query in case of verbose option.
        console.log(prettyPrintExpr(query))
        await client.query(query)
    }
    catch (err) {
        console.error(err)
    }

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

const replaceAll = (str: string, old: string, newStr: string) => {
    return str.split(old).join(newStr)
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

const findDependencies = (migrations: TaggedExpression[]) => {
    const jsonPatterns: PatternAndIndexName[] = []
    migrations.forEach((mig) => {
        jsonPatterns.push(toPattern(mig, <ResourceTypes>mig.type))
    })
    const dependencyIndex = indexReferencedDependencies(migrations, jsonPatterns)
    return dependencyIndex
}

const indexMigrations = (flattened: TaggedExpression[]): NameToExpressions => {
    const indexedMigrations: NameToExpressions = {}
    flattened.forEach((expr) => {
        const indexableName = toIndexableName(expr)
        indexedMigrations[indexableName] = expr
    })
    return indexedMigrations
}

const indexReferencedDependencies = (flattened: TaggedExpression[], jsonPatterns: PatternAndIndexName[]) => {
    const index: NameToDependencyNames = {}

    flattened.forEach((expr) => {
        const indexableName = toIndexableName(expr)
        let found = findPattern(expr.jsonData, jsonPatterns)
        // exclude self in case that would happen (although it shouldn't)
        found = found.filter((e) => e !== indexableName)
        index[indexableName] = found
    })
    return index
}

const toPattern = (mig: TaggedExpression, type: ResourceTypes): PatternAndIndexName => {
    // Seems to be always the same. We could simplify the code
    switch (type) {
        case ResourceTypes.Function:
            return { pattern: { function: mig.name }, indexName: toIndexableName(mig) }
        case ResourceTypes.Role:
            return { pattern: { role: mig.name }, indexName: toIndexableName(mig) }
        case ResourceTypes.Collection:
            return { pattern: { collection: mig.name }, indexName: toIndexableName(mig) }
        case ResourceTypes.Index:
            return { pattern: { index: mig.name }, indexName: toIndexableName(mig) }
        case ResourceTypes.AccessProvider:
            return { pattern: { access_provider: mig.name }, indexName: toIndexableName(mig) }
        default:
            throw new Error(`unknown type in toPattern ${type}`)
    }
}

const indexToDependenciesArray = (dependencyIndex: NameToDependencyNames): DependenciesArrayEl[] => {
    return <DependenciesArrayEl[]>Object.keys(dependencyIndex).map((indexedName) => {
        const dependencIndexNames = dependencyIndex[indexedName]
        return {
            indexedName: indexedName,
            dependencyIndexNames: dependencIndexNames
        }
    }).sort((a, b) => {
        return a.dependencyIndexNames.length - b.dependencyIndexNames.length;
    });

}