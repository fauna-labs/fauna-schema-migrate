var equalDeep = require('deep-equal');
var cloneDeep = require('lodash.clonedeep')

import { TaggedExpression, ReferencedResource, PlannedDiff, PlannedMigrations, LoadedResources, StatementType, ReferencedResources } from "../types/expressions";
import { getAllResourceSnippets } from "../state/from-resource-files";
import { getAllLastMigrationSnippets } from "../state/from-migration-files";
import { UpdateIndexError } from "../errors/UpdateIndexError";
import { ResourceTypes } from "../types/resource-types";
import { findStructure } from "../fql/json";
import { toIndexableName, toIndexableNameFromTypeAndName } from "../util/unique-naming";
import { UndefinedReferenceError } from "../errors/UndefinedReferenceError";
import { camelToSnakeCase } from "../fql/transform";

interface NamedValue {
    name: string;
}

export const planMigrations = async (): Promise<PlannedMigrations> => {
    // There are three inputs.
    //  - Resources:  the FQL that describes your Fauna resources.
    //  - Migrations: migrations derives from the resources. E.g. if you
    //                change your resources and run migrate, it'll capture the diff.
    //  - Cloud:      resources currently in your database.

    const resources = await getAllResourceSnippets()
    // todo, add a flag to ignore this check.
    findIllegalReferences(resources)
    const { migrations, lastMigration } = await getAllLastMigrationSnippets()
    // const cloudResources = await getAllCloudResources()

    // resources determine how your migrations look.
    // migrations are the source of truth of how your cloud
    // should look. The latest migration of a certain migration
    // contains the full state, it's either created from scratch,
    // updated (with the full new parameters) or deleted.
    // Cloud resources are retrieved in order to know references of the resources to update.
    // This means that if you do manual changes in cloud, those will be overwritten!
    return retrieveDiffBetweenResourcesAndMigrations(migrations, resources)
}

const findIllegalReferences = (resourcesFQL: LoadedResources) => {
    const allReferences = findAllReferences(resourcesFQL)
    for (let resourceType in ResourceTypes) {
        const referencesForType = allReferences[resourceType]
        const resourcesForType = resourcesFQL[resourceType]
        const resourceByName: { [key: string]: TaggedExpression } = {}
        resourcesForType.forEach((e) => {
            resourceByName[toIndexableName(e)] = e
        })
        referencesForType.forEach((ref) => {
            const expr = resourceByName[ref.indexableName]
            if (!expr) {
                throw new UndefinedReferenceError(ref)
            }
        })
    }
}

const findAllReferences = (resourcesFQL: LoadedResources): ReferencedResources => {
    const categories: ReferencedResources = {}
    for (let item in ResourceTypes) {
        categories[item] = []
    }
    for (let referenceType in ResourceTypes) {
        const snakeCaseItem = camelToSnakeCase(referenceType)
        // create a strucure of the form { index: { index: ... }}
        const structure: any = {}
        structure[snakeCaseItem] = '*' // value doesn't matter.

        // search in all resources
        for (let resourceType in ResourceTypes) {
            resourcesFQL[resourceType].forEach((res) => {
                const structures = findStructure(structure, res.json)
                const namesAndTypes: ReferencedResource[] = structures.map((e: any) => {
                    return {
                        type: <ResourceTypes>referenceType,
                        name: <string>e[snakeCaseItem],
                        indexableName: toIndexableNameFromTypeAndName(referenceType, e[snakeCaseItem]),
                        resource: res
                    }
                })
                categories[referenceType] = categories[referenceType].concat(namesAndTypes)
            })
        }
    }
    return categories
}


export const retrieveDiffBetweenResourcesAndMigrations = (migrationsFQL: LoadedResources, resourcesFQL: LoadedResources) => {
    // the migrationsFQL param contains the last state of each resource.
    // the resourcesFQL param contains the state of the resources folder for each resource.
    // calculating what has changed is therefore easy.
    const migrationDiff: PlannedMigrations = {}

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
        if (previousIndex !== -1) {
            const res = previouss.splice(previousIndex, 1)
            const previous = res[0]
            if (equalDeep(previous.jsonData, current.jsonData)) {
                pairs.unchanged.push({ target: current, previous: previous })
            }
            else {
                pairs.changed.push({ target: current, previous: previous })
            }
        }
        else if (current.statement === StatementType.Create) {
            pairs.added.push({ target: current })
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
