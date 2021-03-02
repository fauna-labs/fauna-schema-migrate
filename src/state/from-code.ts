

import { addNamesAndTypes, verifyCreateStatementsOnly } from '../fql/match'
import { TaggedExpression, LoadedResources, StatementType } from '../types/expressions'
import { ResourceTypes } from '../types/resource-types'
import { toIndexableName } from '../util/unique-naming'
import { DuplicateResourceError } from '../errors/DuplicateResourceError'
import { evalFQLCode } from '../fql/eval'

import * as fauna from 'faunadb'
import { loadFqlSnippet } from '../util/files'
import { EmptyResourceFileError } from '../errors/EmptyResourceFileError'
const q = fauna.query

export const getSnippetsFromPaths = async (paths: string[], atChildDbPath: string[] = []): Promise<LoadedResources> => {
    let snippets: fauna.Expr[] = []
    for (let i = 0; i < paths.length; i++) {
        const p = paths[i]
        const snippet = await loadFqlSnippet(p)
        if (!snippet) {
            throw new EmptyResourceFileError(p)
        }
    }
    return getSnippetsFromCode(snippets, atChildDbPath)
}

export const getSnippetsFromStrings = (codeSnippets: string[], atChildDbPath: string[] = []): LoadedResources => {
    let snippets: fauna.Expr[] = []
    for (let i = 0; i < codeSnippets.length; i++) {
        const expr = evalFQLCode(codeSnippets[i])
        snippets.push(expr)
    }
    return getSnippetsFromCode(snippets, atChildDbPath)
}

export const getSnippetsFromCode = (codeSnippets: fauna.Expr[], atChildDbPath: string[] = []): LoadedResources => {
    let snippets: TaggedExpression[] = []
    for (let i = 0; i < codeSnippets.length; i++) {
        const snippet = codeSnippets[i]
        snippets.push({
            fqlExpr: snippet,
            fql: (snippet as any).toFQL(),
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
        if (byNameAndType[key]) {
            throw new DuplicateResourceError(snippet)
        }
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
