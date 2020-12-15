var equalDeep = require('deep-equal');
var cloneDeep = require('lodash.clonedeep')

import { TaggedExpression, PreviousAndCurrent, PlannedDiff, PlannedMigrations, LoadedResources, StatementType } from "../types/expressions";
import { getAllResourceSnippets } from "../state/from-resource-files";
import { getAllCloudResources } from "../state/from-cloud";
import { getAllMigrationSnippets } from "../state/from-migration-files";
import { TriedDeletingMissingCloudResourceError } from "../errors/TriedDeletingMissingCloudResourceError";
import { TriedChangingMissingCloudResourceError } from "../errors/TriedChangingMissingCloudResourceError";
import { retrieveReference as retrieveCloudReference } from "../fql/types";

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
    const migrationsFQL = await getAllMigrationSnippets()
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

    // We don't need the reference on second thought, currently not used.
    // addReferences(migrationDiff, cloudResources)
    console.log(migrationDiff)
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
            console.log('equalDeep?', previous.jsonData, current.jsonData)
            if (equalDeep(previous.jsonData, current.jsonData)) {
                console.log('TRUE!')
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


// const addReferences = (migrationDiff: PlannedMigrations, cloudResources: LoadedResources) => {
//     Object.keys(migrationDiff).forEach((type) => {
//         const diffForType = migrationDiff[type]
//         diffForType.changed.forEach((v: PreviousAndCurrent) => {
//             const index = findIndex(<NamedValue>v.current, cloudResources[type])
//             if (index === -1) {
//                 const res = <TaggedExpression>v.current
//                 throw new TriedChangingMissingCloudResourceError(res)
//             }
//             else {
//                 v.ref = retrieveCloudReference(cloudResources[type][index])
//             }
//         })
//         diffForType.deleted.forEach((v: PreviousAndCurrent) => {
//             const index = findIndex(<NamedValue>v.previous, cloudResources[type])
//             if (index === -1) {
//                 const res = <TaggedExpression>v.previous
//                 throw new TriedDeletingMissingCloudResourceError(res)
//             }
//             else {
//                 v.ref = retrieveCloudReference(cloudResources[type][index])
//             }
//         })
//     })
// }
