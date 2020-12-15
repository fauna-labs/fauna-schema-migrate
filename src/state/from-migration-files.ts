
import toJsonDeep from '../fql/to-json-deep'
import { loadFqlSnippet, retrieveAllMigrationPaths, } from '../util/files'
import { addNamesAndTypes } from '../fql/types'
import { TaggedExpression, LoadedResources } from '../types/expressions'
import { MigrationPathAndFiles, MigrationPathAndExpressions } from '../types/migrations'
import { ResourceTypes } from '../types/resource-types'


export const getAllMigrationSnippets = async (): Promise<LoadedResources> => {
    // Retrieve all migration folders and their files.
    // the return value is an ordered array containin the
    // migration and the file paths.
    const pathsAndFiles: MigrationPathAndFiles[] = await retrieveAllMigrationPaths()

    for (let i = 0; i < pathsAndFiles.length; i++) {
        const pathAndfile = pathsAndFiles[i]
        pathAndfile.expressions = await Promise.all(pathAndfile.files.map(async (f) => {
            const snippet = await loadFqlSnippet(f)
            const json = toJsonDeep(snippet)
            console.log('snippet', snippet)
            return {
                fqlExpr: snippet,
                json: json,
                fql: snippet.toFQL(),
                name: '',
                jsonData: {}
            }
        }))
    }

    const pathsAndExpressions: MigrationPathAndExpressions[] = <MigrationPathAndExpressions[]>pathsAndFiles

    // Then we filter out all previous versions of a resource. We only want the information
    // of the last migration.

    const latestByNameAndType: any = {}
    pathsAndExpressions.forEach((pathAndExpressions) => {
        console.log('migration')
        addNamesAndTypes(pathAndExpressions.expressions)

        pathAndExpressions.expressions.forEach((expr) => {
            const key = `${expr.name}_-_${expr.type}`
            // just override, pathsAndExpressions are ordered.
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
