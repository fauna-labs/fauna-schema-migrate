var equalDeep = require('deep-equal');
var cloneDeep = require('lodash.clonedeep')

import { TaggedExpression, PlannedDiff, LoadedResources, StatementType, PlannedDiffPerResource, PlannedDatabaseDiff } from "../types/expressions";
import { UpdateIndexError } from "../errors/UpdateIndexError";
import { ResourceTypes } from "../types/resource-types";
import { transformCreateToDelete, transformCreateToUpdate, transformDbPathToCreate, transformDbPathToDelete, transformDbPathToUpdate, transformUpdateToCreate, transformUpdateToDelete, transformUpdateToUpdate } from '../fql/transform'

interface NamedValue {
    name: string;
}

export const retrieveDatabasesDiff = async (currentDbs: string[][], targetDbs: string[][]): Promise<TaggedExpression[]> => {
    const dbDiff: TaggedExpression[] = []
    currentDbs.forEach((c) => {
        const stillExists = targetDbs.some((t) => equalDeep(c, t))
        if (stillExists) {
            // don't support metadata for dbs atm.
            dbDiff.push(transformDbPathToUpdate(c))
        }
        else {
            dbDiff.push(transformDbPathToDelete(c))
        }
    })
    targetDbs.forEach((t) => {
        const didExistBefore = currentDbs.some((c) => equalDeep(c, t))
        if (!didExistBefore) {
            dbDiff.push(transformDbPathToCreate(t))
        }
    })
    return dbDiff
}


export const retrieveDiff = (migrationsFQL: LoadedResources, resourcesFQL: LoadedResources) => {
    // the migrationsFQL param contains the last state of each resource.
    // the resourcesFQL param contains the state of the resources folder for each resource.
    // calculating what has changed is therefore easy.
    const migrationDiff: PlannedDiffPerResource = {}

    Object.keys(migrationsFQL).forEach((type: string) => {
        const migration: any = cloneDeep(migrationsFQL[type])
        const resource: any = cloneDeep(resourcesFQL[type])
        migrationDiff[type] = createPairsForType(migration, resource)
    })

    // Index updates are not supported (and can't be), throw error.
    throwErrorOnIndexUpdates(migrationDiff[ResourceTypes.Index])
    return migrationDiff
}

/* We'll match them by name */
const createPairsForType = (previouss: TaggedExpression[], currents: TaggedExpression[]) => {
    const pairs: PlannedDiff = {
        added: [],
        changed: [],
        unchanged: [],
        deleted: []
    }
    while (currents.length > 0) {
        // Careful, this logic is used both for comparing pure Create statements (resources)
        // where two consecutive Create statements result in a change.
        // as well as comparing migrations (which contain Create/Update/Delete)
        const current = <TaggedExpression>currents.pop()
        const previousIndex = findIndex(current, previouss)
        if (current?.statement === StatementType.Delete) {
            // ignore deletes
        }
        else if (previousIndex !== -1) {
            const res = previouss.splice(previousIndex, 1)
            const previous = res[0]
            if (equalDeep(previous.jsonData, current.jsonData)) {
                pairs.unchanged.push({ target: current, previous: previous })
            }
            else {
                pairs.changed.push({ target: current, previous: previous })
            }
        }
        else {
            pairs.added.push({ target: current })
        }
    }

    while (previouss.length > 0) {
        const previous = previouss.pop()
        pairs.deleted.push({ previous: previous })
    }

    return pairs
}

export const transformDiffToExpressions = (diff: PlannedDiffPerResource): TaggedExpression[] => {
    const expressions: TaggedExpression[] = []
    for (let resourceType in ResourceTypes) {
        const diffForType = diff[resourceType]
        diffForType.added.map((prevCurr) => {
            if (prevCurr.target?.statement === StatementType.Update) {
                expressions.push(transformUpdateToCreate(prevCurr.target))
            }
            else if (prevCurr.target?.statement === StatementType.Create) {
                expressions.push(prevCurr.target)
            }
            else {
                throw Error(`Unexpected type in rollback ${prevCurr.target?.statement}`)
            }
        })

        diffForType.changed.map((prevCurr) => {
            // CHANGED
            // changed in rollback means that the migrations we are rolling back did an update.
            // The previous statement can be both a Create as an Update and since the resource
            // already exists it needs to be trasnformed to an Update.
            if (prevCurr.target?.statement === StatementType.Update) {
                // if it's an update, keep it
                expressions.push(transformUpdateToUpdate(prevCurr.target))
            }
            else if (prevCurr.target?.statement === StatementType.Create) {
                // if it's a create. trasnform to an update.
                expressions.push(transformCreateToUpdate(prevCurr.target))
            }
            else {
                throw Error(`Unexpected type in rollback ${prevCurr.target?.statement}`)
            }

        })

        diffForType.deleted.map((prevCurr) => {
            // ADDED
            // deleted in rollback means that the migrations we are rolling back added a resource.
            // The previous statement should therefore be a CREATE or UDPATE statement and
            // the current will not exist. We need to replace it with a DELETE
            if (prevCurr.previous?.statement === StatementType.Update) {
                // if it's an update, keep it
                expressions.push(transformCreateToDelete(prevCurr.previous))
            }
            else if (prevCurr.previous?.statement === StatementType.Create) {
                // if it's a create. trasnform to an update.
                expressions.push(transformUpdateToDelete(prevCurr.previous))
            }
            else {
                throw Error(`Unexpected type in rollback ${prevCurr.target?.statement}`)
            }
        })
    }
    return expressions
}


const findIndex = (resource1: NamedValue, resources: NamedValue[]) => {
    let index = 0
    for (let resource2 of resources) {
        if (resource2.name === resource1.name) {
            return index
        }
        index++
    }
    return -1
}

const throwErrorOnIndexUpdates = (indices: PlannedDiff) => {
    if (indices.changed.length > 0) {
        throw new UpdateIndexError(indices.changed)
    }
}



