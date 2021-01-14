
import { toJsonDeep } from '../fql/json'
import { loadFqlSnippet, retrieveAllMigrationPaths as retrieveLastMigrationVersionAndPaths, retrieveLastMigrationVersionAndPathsForMigrationBefore, retrieveMigrationPathsForMigrationAfter, } from '../util/files'
import { addNamesAndTypes } from '../fql/match'
import { TaggedExpression, LoadedResources, LoadedResourcesAndLastMigration, StatementType } from '../types/expressions'
import { MigrationPathAndFiles, MigrationPathAndExpressions } from '../types/migrations'
import { ResourceTypes } from '../types/resource-types'
import { toIndexableName } from '../util/unique-naming'
import { DuplicateMigrationError } from '../errors/DuplicateMigrationError'

// Gets snippets from next migration after given timestamp.
// If no timestamp is provided, we will retrieve the last migration.
export const getSnippetsFromNextMigration = async (after: string): Promise<{ categories: LoadedResources, migration: string }> => {
    if (!after) {
        after = "0"
    }
    const pathAndfile = await retrieveMigrationPathsForMigrationAfter(after)
    console.log(pathAndfile)
    pathAndfile.expressions = await Promise.all(pathAndfile.files.map(async (f) => {
        const snippet = await loadFqlSnippet(f)
        const json = toJsonDeep(snippet)
        return {
            fqlExpr: snippet,
            json: json,
            fql: snippet.toFQL(),
            name: '',
            jsonData: {},
            migration: pathAndfile.migration
        }
    }))
    const pathsAndExpression: MigrationPathAndExpressions = <MigrationPathAndExpressions>pathAndfile
    addNamesAndTypes(pathsAndExpression.expressions)

    const categories: any = {}
    for (let item in ResourceTypes) {
        categories[item] = []
    }
    pathsAndExpression.expressions.forEach((s) => {
        categories[<string>s.type].push(s)
    })

    return { migration: pathAndfile.migration, categories: categories }
}

// This will get All migrations but only retain the last version
// of the migration for each type and name.
// this is in stark contrast with getSnippetsFromLastMigration
export const getAllLastMigrationSnippets = async (before: string | null = null): Promise<LoadedResourcesAndLastMigration> => {
    // Retrieve all migration folders and their files.
    // the return value is an ordered array containin the
    // migration and the file paths.
    let pathsAndFiles: MigrationPathAndFiles[] = []
    // sort on migration to be certain.
    pathsAndFiles = await retrieveLastMigrationVersionAndPathsForMigrationBefore(before)
    pathsAndFiles.sort((a, b) => (a.migration > b.migration) ? 1 : ((b.migration > a.migration) ? -1 : 0))
    let lastMigration = pathsAndFiles.length > 0 ? pathsAndFiles[pathsAndFiles.length - 1].migration : "0"

    for (let i = 0; i < pathsAndFiles.length; i++) {
        const pathAndfile = pathsAndFiles[i]
        pathAndfile.expressions = await Promise.all(pathAndfile.files.map(async (f) => {
            const snippet = await loadFqlSnippet(f)
            const json = toJsonDeep(snippet)
            return {
                fqlExpr: snippet,
                json: json,
                fql: snippet.toFQL(),
                name: '',
                jsonData: {},
                migration: pathAndfile.migration,
                previousVersions: []
            }
        }))
    }

    const pathsAndExpressions: MigrationPathAndExpressions[] = <MigrationPathAndExpressions[]>pathsAndFiles

    // Then we filter out all previous versions of a resource. We only want the information
    // of the last migration.
    const latestByNameAndType: any = {}
    const previousVersionsByNameAndType: any = {}
    pathsAndExpressions.forEach((pathAndExpressions) => {
        addNamesAndTypes(pathAndExpressions.expressions)
        pathAndExpressions.expressions.forEach((expr) => {
            const key = toIndexableName(expr)
            // If there is already an expression for this name and
            // it was present in the same migration, error, that shouldn't happen.
            if (latestByNameAndType[key] && latestByNameAndType[key].migration === expr.migration) {
                throw new DuplicateMigrationError(expr)
            }
            // We do not include Delete statements in the 'last version'.
            // the result of this function is only Create/Delete statements.
            if (expr.statement === StatementType.Delete) {
                previousVersionsByNameAndType[key] = []
                delete latestByNameAndType[key]
            }
            // Else, just override, pathsAndExpressions are ordered.
            // That way we get the latest migrations.
            else if (latestByNameAndType[key]) {
                if (!previousVersionsByNameAndType[key]) {
                    previousVersionsByNameAndType[key] = []
                }
                previousVersionsByNameAndType[key].push(latestByNameAndType[key])
                latestByNameAndType[key] = expr
            }
            else {
                latestByNameAndType[key] = expr
            }
        })
    })


    // order them in categories
    const categories: any = {}
    for (let item in ResourceTypes) {
        categories[item] = []
    }
    Object.keys(latestByNameAndType).forEach((key) => {
        const latestExpression = latestByNameAndType[key]
        // Deletes are only useful information if they are the last migration.
        // else we can just ignore the migration.
        if (latestExpression.statement !== StatementType.Delete || latestExpression.migration === lastMigration) {
            categories[<string>latestExpression.type].push(latestExpression)
        }
        latestExpression.previousVersions = previousVersionsByNameAndType[key] ?
            previousVersionsByNameAndType[key].reverse() : []
    })

    return { lastMigration: lastMigration, migrations: categories }
}

