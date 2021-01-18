
import { toJsonDeep } from '../fql/json'
import { filePathToDatabase, loadFqlSnippet, retrieveLastMigrationVersionAndPathsForMigrationBefore } from '../util/files'
import { addNamesAndTypes } from '../fql/match'
import { LoadedResourcesAndLastMigration, StatementType, TaggedExpression } from '../types/expressions'
import { MigrationPathAndFiles, MigrationPathAndExpressions } from '../types/migrations'
import { ResourceTypes } from '../types/resource-types'
import { toIndexableName, toIndexableNameWithDb } from '../util/unique-naming'
import { DuplicateMigrationError } from '../errors/DuplicateMigrationError'
import { config } from '../util/config'

export const getAllLastDatabases = async (before: string | null = null, ignoreChildDb: boolean = true) => {
    const snippets = await getAllLastMigrationSnippets([], before, ignoreChildDb)
    return transformMigrationsToDbPaths(snippets.migrations.Database)
}

const transformMigrationsToDbPaths = (dbMigrations: TaggedExpression[]) => {
    return dbMigrations
        .filter((migExpr => migExpr.statement !== StatementType.Delete))
        .map((migExpr) => migExpr.db.concat([migExpr.name]))
}

// This will get All migrations but only retain the last version
// of the migration for each type and name.
// this is in stark contrast with getSnippetsFromLastMigration
export const getAllLastMigrationSnippets = async (atChildDbPath: string[] = [], before: string | null = null, ignoreChildDb: boolean = true): Promise<LoadedResourcesAndLastMigration> => {

    const childDbName = await config.getChildDbsDirName()
    // Retrieve all migration folders and their files.
    // the return value is an ordered array containin the
    // migration and the file paths.
    let pathsAndFiles: MigrationPathAndFiles[] = []
    // sort on migration to be certain.
    pathsAndFiles = await retrieveLastMigrationVersionAndPathsForMigrationBefore(atChildDbPath, before, ignoreChildDb)
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
                previousVersions: [],
                db: filePathToDatabase(childDbName, f)
            }
        }))
    }

    const pathsAndExpressions: MigrationPathAndExpressions[] = <MigrationPathAndExpressions[]>pathsAndFiles

    // Then we filter out all previous versions of a resource. We only want the information
    // of the last migration.
    const latestByNameAndType: any = {}
    const previousVersionsByDbNameAndType: any = {}
    pathsAndExpressions.forEach((pathAndExpressions) => {
        addNamesAndTypes(pathAndExpressions.expressions)
        pathAndExpressions.expressions.forEach((expr) => {
            const key = toIndexableNameWithDb(expr)
            // If there is already an expression for this name and
            // it was present in the same migration, error, that shouldn't happen.
            if (latestByNameAndType[key] && latestByNameAndType[key].migration === expr.migration) {
                throw new DuplicateMigrationError(expr)
            }
            // We do not include Delete statements in the 'last version'.
            // the result of this function is only Create/Delete statements.
            if (expr.statement === StatementType.Delete) {
                previousVersionsByDbNameAndType[key] = []
                delete latestByNameAndType[key]
            }
            // Else, just override, pathsAndExpressions are ordered.
            // That way we get the latest migrations.
            else if (latestByNameAndType[key]) {
                if (!previousVersionsByDbNameAndType[key]) {
                    previousVersionsByDbNameAndType[key] = []
                }
                previousVersionsByDbNameAndType[key].push(latestByNameAndType[key])
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
        latestExpression.previousVersions = previousVersionsByDbNameAndType[key] ?
            previousVersionsByDbNameAndType[key].reverse() : []
    })

    return { lastMigration: lastMigration, migrations: categories }
}
