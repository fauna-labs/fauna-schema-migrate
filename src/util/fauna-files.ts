import path from 'path'
import fs from 'fs'
import * as esbuild from 'esbuild'

import { evalFQLCode } from '../fql/eval'
import toJsonDeep from '../fql/to-json-deep'

import * as config from '../util/config'
import { loadApplicationFile, loadResourceFiles } from '../util/files'
import { isCreateUdfExpression, isCreateRoleExpression } from '../fql/types'
import { TaggedExpression, LoadedResources } from '../types/expressions'

export const getAllSnippets = async (paths: string[]): Promise<LoadedResources> => {
    let snippets: TaggedExpression[] = []
    for (let i = 0; i < paths.length; i++) {
        const p = paths[i]
        const snippet = await loadFqlSnippet(p)
        const fql = await snippet.toFQL()
        const json = toJsonDeep(snippet)
        snippets.push({
            fqlExpr: snippet,
            json: json,
            fql: snippet.toFQL(),
            name: '',
            jsonData: {}
        })
    }
    // order them in categories
    const categories: any = {
        collections: [],
        indexes: [],
        databases: [],
        roles: [],
        functions: [],
        accessproviders: []
    }
    snippets.forEach((s) => {
        switch (true) {
            case isCreateUdfExpression(s):
                // code block
                console.log(s.json)
                s.name = s.json.create_function.object.name
                s.type = 'function'
                categories.functions.push(s)
                break;
            case isCreateRoleExpression(s):
                console.log(s.json)

                s.jsonData = extractRoleData(s.json)
                s.name = s.json.create_role.object.name
                s.type = 'role'
                categories.roles.push(s)
                break;
            default:
                throw new Error(`Unknown snippet type ${s.toString().substring(0, 50)} ...`)
            // code block
        }
    })
    return categories
}

const loadFqlSnippet = async (p: string) => {
    if (p.endsWith('.js')) {
        console.log('Loaded FQL via  JS driver')
        return await loadJsResource(p)
    }
    else if (p.endsWith('.fql')) {
        console.log('Loaded FQL from FQL file')
        return await loadFqlResource(p)
    }
    else {
        console.error(`unexpected extension ${p}`)
    }
}

const loadJsResource = async (p: string) => {
    try {
        // a JS resource will be compiled to the temporary
        // folder first since it might import other
        // pieces of code, a regular dynamic import() would not work.
        await esbuild.build({
            entryPoints: [p],
            outdir: await config.getTempDir(),
            bundle: true,
            platform: "node",
            format: "cjs",
            target: ["node10.4"]
        });

        const fql = await require(path.join(
            process.cwd(),
            await config.getTempDir(),
            path.parse(p).base)
        )
        return fql.default
    } catch (err) {
        console.log(err);
        return;
    }
}

const loadFqlResource = async (p: string) => {
    const data = await loadApplicationFile(p)
    const fql = evalFQLCode(data)
    return fql
}

// Transform it to be closer to how it looks when
// you query the role from Fauna via Get(Role(..))
const extractRoleData = (json: any) => {
    return json.create_role.object
}