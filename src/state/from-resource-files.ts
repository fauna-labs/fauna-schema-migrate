
import * as fauna from 'faunadb'

import { toJsonDeep } from '../fql/json'
import { loadFqlSnippet, retrieveAllResourceChildDb, retrieveAllResourcePaths, } from '../util/files'
import { addNamesAndTypes } from '../fql/match'
import { TaggedExpression, LoadedResources, StatementType } from '../types/expressions'
import { ResourceTypes } from '../types/resource-types'
import { toIndexableName } from '../util/unique-naming'
import { DuplicateResourceError } from '../errors/DuplicateResourceError'

const q = fauna.query
const { CreateDatabase } = fauna.query

export const getAllResourceSnippets = async (atChildDbPath: string[] = []): Promise<LoadedResources> => {
    console.log("TODO, fetch child db resources")
    const paths = await retrieveAllResourcePaths()

    let snippets: TaggedExpression[] = []
    for (let i = 0; i < paths.length; i++) {
        const p = paths[i]
        const snippet = await loadFqlSnippet(p)
        const json = toJsonDeep(snippet)
        snippets.push({
            fqlExpr: snippet,
            json: json,
            fql: snippet.toFQL(),
            name: '',
            jsonData: {},
            // a resource file should always be a create!
            statement: StatementType.Create
        })
    }

    // Databases are folders, not snippets, transform them to snippets.
    const dbpaths = await retrieveAllResourceChildDb()
    const directChildPaths = filterWithPrefix(dbpaths, atChildDbPath).flat()
    directChildPaths.forEach((childDbName) => {
        const createDbFql: any = CreateDatabase({
            name: childDbName
        })
        const json = toJsonDeep(createDbFql)

        snippets.push({
            fqlExpr: createDbFql,
            json: json,
            fql: createDbFql.toFQL(),
            name: '',
            jsonData: {},
            // a resource file should always be a create!
            statement: StatementType.Create
        })
    })

    const categories: any = {}
    for (let item in ResourceTypes) {
        categories[item] = []
    }
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

    snippets.forEach((s) => {
        categories[<string>s.type].push(s)
    })

    return categories
}

// Filters arrays out that have the prefix and only have
// one element left after removing the prefix.
const filterWithPrefix = (arr: string[][], prefix: string[]) => {
    return arr.filter((a) =>
        a.length == prefix.length + 1 && arraysEqual(a.slice(0, prefix.length), prefix))
}

const arraysEqual = (a: string[], b: string[]) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}