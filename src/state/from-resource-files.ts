

import { loadFqlSnippet, retrieveAllResourcePaths, } from '../util/files'
import { addNamesAndTypes, verifyCreateStatementsOnly } from '../fql/match'
import { TaggedExpression, LoadedResources, StatementType } from '../types/expressions'
import { ResourceTypes } from '../types/resource-types'
import { toIndexableName } from '../util/unique-naming'
import { DuplicateResourceError } from '../errors/DuplicateResourceError'
import { EmptyResourceFileError } from '../errors/EmptyResourceFileError'

export const getAllResourceSnippets = async (atChildDbPath: string[] = []): Promise<LoadedResources> => {
    const paths = await retrieveAllResourcePaths(atChildDbPath)
    let snippets: TaggedExpression[] = []
    for (let i = 0; i < paths.length; i++) {
        const p = paths[i]
        const snippet = await loadFqlSnippet(p)
        if (!snippet) {
            throw new EmptyResourceFileError(p)
        }
        snippets.push({
            fqlExpr: snippet,
            fql: snippet.toFQL(),
            name: '',
            jsonData: {},
            // a resource file should always be a create!
            statement: StatementType.Create,
            db: atChildDbPath
        })
    }

    verifyCreateStatementsOnly(snippets)
    addNamesAndTypes(snippets)


    const byNameAndType: any = {}
    snippets.forEach((snippet) => {
        const key = toIndexableName(snippet)
        // If there is already an expression for this name and
        // it was present in the same migration, error, that shouldn't happen.
        if (byNameAndType[key]) {
            throw new DuplicateResourceError(snippet)
        }
        // Else, just override, pathsAndExpressions are ordered.
        // That way we get the latest migrations.
        byNameAndType[key] = snippet
    })

    const categories: any = {}
    for (let item in ResourceTypes) {
        categories[item] = []
    }
    snippets.forEach((s) => {
        categories[<string>s.type].push(s)
    })

    return categories
}
