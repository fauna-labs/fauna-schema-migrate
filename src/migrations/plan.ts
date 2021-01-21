

import { TaggedExpression, ReferencedResource, PlannedDiffPerResource, LoadedResources, StatementType, ReferencedResources } from "../types/expressions";
import { getAllResourceSnippets } from "../state/from-resource-files";
import { getAllLastDatabases, getAllLastMigrationSnippets } from "../state/from-migration-files";
import { ResourceTypes } from "../types/resource-types";
import { findStructure } from "../fql/json";
import { toIndexableName, toIndexableNameFromTypeAndName } from "../util/unique-naming";
import { UndefinedReferenceError } from "../errors/UndefinedReferenceError";
import { camelToSnakeCase } from "../fql/transform";
import { retrieveDatabasesDiff, retrieveDiff } from "./diff";
import { retrieveAllResourceChildDb } from "../util/files";

interface NamedValue {
    name: string;
}

export const planDatabaseMigrations = async () => {
    const allResourceChildDbs = await retrieveAllResourceChildDb([])
    const allMigrationChildDbs = await getAllLastDatabases(null, false)
    // They should be sorted according to the length of the child db path.
    const dbDiff = await retrieveDatabasesDiff(allMigrationChildDbs, allResourceChildDbs)
    dbDiff.sort((a, b) => a.db.length >= b.db.length ? 1 : -1)
    return dbDiff
}


export const planMigrations = async (atChildDbPath: string[] = [], extraDbExpr: TaggedExpression[] = []): Promise<PlannedDiffPerResource> => {
    // There are three inputs.
    //  - Resources:  the FQL that describes your Fauna resources.
    //  - Migrations: migrations derives from the resources. E.g. if you
    //                change your resources and run migrate, it'll capture the diff.
    //  - Cloud:      resources currently in your database.
    const resources = await getAllResourceSnippets(atChildDbPath)
    extraDbExpr.forEach((e) => {
        resources[<ResourceTypes>e.type].push(e)
    })
    // IGNORE for now, illegal references is not something that can easily be verified.
    findIllegalReferences(resources)
    const { migrations } = await getAllLastMigrationSnippets(atChildDbPath)
    // Resources determine how your current data looks.
    // Migraitons are generated from resources.
    // A diff between migrations means comparing the Resources that exist with
    // the last seen migration of a certain resource.

    return retrieveDiff(migrations, resources)
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
        structure["raw"] = {}
        structure["raw"][snakeCaseItem] = '*' // value doesn't matter.

        // search in all resources
        for (let resourceType in ResourceTypes) {
            resourcesFQL[resourceType].forEach((res) => {
                const structures = findStructure(structure, res.fqlExpr)
                const namesAndTypes: ReferencedResource[] = structures.map((e: any) => {
                    return {
                        type: <ResourceTypes>referenceType,
                        name: <string>e[snakeCaseItem],
                        indexableName: toIndexableNameFromTypeAndName(referenceType, e.raw[snakeCaseItem]),
                        resource: res
                    }
                })
                categories[referenceType] = categories[referenceType].concat(namesAndTypes)
            })
        }
    }
    return categories
}



