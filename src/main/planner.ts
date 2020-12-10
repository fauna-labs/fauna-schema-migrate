var equalDeep = require('deep-equal');
var cloneDeep = require('lodash.clonedeep')

import { TaggedExpression, LoadedResources, PlannedDiff, PlannedMigrations } from "../types/expressions";
import { getAllSnippets } from "../util/fauna-files";
import { getAllResources } from "../util/fauna-resources";

interface NamedValue {
    name: string;
}

export const planMigrations = async (paths: string[]): Promise<PlannedMigrations> => {
    const localFQL = await getAllSnippets(paths)
    const remoteFQL = await getAllResources()
    localFQL.roles.map((e: any) => { console.log(JSON.stringify(e.jsonData, null, 2)) })
    remoteFQL.roles.map((e: any) => { console.log(JSON.stringify(e.jsonData, null, 2)) })

    const matched: any = {}
    Object.keys(remoteFQL).forEach((type: string) => {
        const remotes: any = cloneDeep(remoteFQL[type])
        const locals: any = cloneDeep(localFQL[type])
        matched[type] = createPairsForType(remotes, locals)
    })
    return <PlannedMigrations>matched
}

/* We'll match them by name */
const createPairsForType = (remotes: TaggedExpression[], locals: TaggedExpression[]) => {
    const pairs: PlannedDiff = {
        added: [],
        changed: [],
        unchanged: [],
        deleted: []
    }
    while (locals.length > 0) {
        const local = <TaggedExpression>locals.pop()
        const remoteIndex = findIndexRemote(local, remotes)
        if (remoteIndex !== -1) {
            const res = remotes.splice(remoteIndex, 1)
            const remote = res[0]
            if (equalDeep(remote.jsonData, local.jsonData)) {
                pairs.unchanged.push({ local: local, remote: remote })
            }
            else {
                pairs.changed.push({ local: local, remote: remote })
            }
        }
        else {
            pairs.added.push({ local: local })
        }
    }

    while (remotes.length > 0) {
        const remote = remotes.pop()
        pairs.deleted.push({ remote: remote })
    }

    return pairs
}

const findIndexRemote = (resource1: NamedValue, resources: NamedValue[]) => {
    let index = 0
    for (let resource2 of resources) {
        if (resource2.name === resource1.name) {
            return index
        }
        index++
    }
    return -1
}

