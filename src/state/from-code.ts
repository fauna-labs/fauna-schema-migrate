

import { addNamesAndTypes, verifyCreateStatementsOnly } from '../fql/match'
import { TaggedExpression, LoadedResources, StatementType } from '../types/expressions'
import { ResourceTypes } from '../types/resource-types'
import { toIndexableName } from '../util/unique-naming'
import { DuplicateResourceError } from '../errors/DuplicateResourceError'
import { evalFQLCode } from '../fql/eval'

export const getSnippetsFromCode = (codeSnippets: string[], atChildDbPath: string[] = []): LoadedResources => {
    let snippets: TaggedExpression[] = []
    for (let i = 0; i < codeSnippets.length; i++) {
        const snippet = evalFQLCode(codeSnippets[i])
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
