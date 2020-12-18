
import { toJsonDeep } from '../fql/json'
import { loadFqlSnippet, retrieveAllMigrationPaths, retrieveMigrationPathsForMigrationAfter, } from '../util/files'
import { addNamesAndTypes } from '../fql/match'
import { TaggedExpression, LoadedResources } from '../types/expressions'
import { MigrationPathAndFiles, MigrationPathAndExpressions } from '../types/migrations'
import { ResourceTypes } from '../types/resource-types'
import { toIndexableName } from '../util'
import { DuplicateMigrationError } from '../errors/DuplicateMigrationError'

// Gets snippets from next migration after given timestamp.
// If no timestamp is provided, we will retrieve the last migration.
export const getSnippetsFromNextMigration = async (timestamp: string = "Z"): Promise<{ categories: LoadedResources, migration: string }> => {
    const pathAndfile = await retrieveMigrationPathsForMigrationAfter(timestamp)
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
export const getAllLastMigrationSnippets = async (): Promise<LoadedResources> => {
    // Retrieve all migration folders and their files.
    // the return value is an ordered array containin the
    // migration and the file paths.
    const pathsAndFiles: MigrationPathAndFiles[] = await retrieveAllMigrationPaths()
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
                migration: pathAndfile.migration
            }
        }))
    }

    const pathsAndExpressions: MigrationPathAndExpressions[] = <MigrationPathAndExpressions[]>pathsAndFiles

    // Then we filter out all previous versions of a resource. We only want the information
    // of the last migration.

    const latestByNameAndType: any = {}
    pathsAndExpressions.forEach((pathAndExpressions) => {
        addNamesAndTypes(pathAndExpressions.expressions)
        pathAndExpressions.expressions.forEach((expr) => {
            const key = toIndexableName(expr)
            // If there is already an expression for this name and
            // it was present in the same migration, error, that shouldn't happen.
            if (latestByNameAndType[key] && latestByNameAndType[key].migration === expr.migration) {
                throw new DuplicateMigrationError(expr)
            }
            // Else, just override, pathsAndExpressions are ordered.
            // That way we get the latest migrations.
            latestByNameAndType[key] = expr
        })
    })

    const latestExpressions: TaggedExpression[] = Object.values(latestByNameAndType)

    // order them in categories
    const categories: any = {}
    for (let item in ResourceTypes) {
        categories[item] = []
    }
    latestExpressions.forEach((s) => {
        categories[<string>s.type].push(s)
    })

    return categories
}
