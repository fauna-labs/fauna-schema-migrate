var equalDeep = require('deep-equal');
var cloneDeep = require('lodash.clonedeep')

import { TaggedExpression, PreviousAndCurrent, PlannedDiff, PlannedMigrations, LoadedResources, StatementType } from "../types/expressions";
import { getAllResourceSnippets } from "../state/from-resource-files";
import { getAllLastMigrationSnippets } from "../state/from-migration-files";
import { UpdateIndexError } from "../errors/UpdateIndexError";
import { ResourceTypes } from "../types/resource-types";

interface NamedValue {
    name: string;
}

export const planMigrations = async (): Promise<PlannedMigrations> => {
    // There are three inputs.
    //  - Resources:  the FQL that describes your Fauna resources.
    //  - Migrations: migrations derives from the resources. E.g. if you
    //                change your resources and run migrate, it'll capture the diff.
    //  - Cloud:      resources currently in your database.

    const resourcesFQL = await getAllResourceSnippets()
    const migrationsFQL = await getAllLastMigrationSnippets()
    // const cloudResources = await getAllCloudResources()
    const migrationDiff: any = {}

    // resources determine how your migrations look.
    // migrations are the source of truth of how your cloud
    // should look. The latest migration of a certain migration
    // contains the full state, it's either created from scratch,
    // updated (with the full new parameters) or deleted.
    // Cloud resources are retrieved in order to know references of the resources to update.
    // This means that if you do manual changes in cloud, those will be overwritten!

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
        const current = <TaggedExpression>currents.pop()
        const previousIndex = findIndex(current, previouss)
        if (previousIndex !== -1) {
            const res = previouss.splice(previousIndex, 1)
            const previous = res[0]
            if (equalDeep(previous.jsonData, current.jsonData)) {
                pairs.unchanged.push({ current: current, previous: previous })
            }
            else {
                pairs.changed.push({ current: current, previous: previous })
            }
        }
        else {
            pairs.added.push({ current: current })
        }
    }

    while (previouss.length > 0) {
        const previous = previouss.pop()
        if (previous?.statement !== StatementType.Delete) {
            pairs.deleted.push({ previous: previous })
        }
    }

    return pairs
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
