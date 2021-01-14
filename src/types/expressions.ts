import { ResourceTypes } from "./resource-types";

export enum StatementType {
    Create,
    Update,
    Delete
}

export interface TaggedExpression {
    name: string,
    type?: ResourceTypes,
    fqlExpr?: any,
    json?: any,
    jsonData?: any,
    fql?: string,
    fqlFormatted?: string,
    statement?: StatementType
    migration?: string
    previousVersions?: TaggedExpression[]
}

export interface ReferencedResource {
    name: string,
    indexableName: string,
    type: ResourceTypes,
    resource: TaggedExpression
}

export interface PreviousAndCurrent {
    target?: TaggedExpression,
    previous?: TaggedExpression,
    ref?: any
}

export interface PlannedDiff {
    added: PreviousAndCurrent[],
    changed: PreviousAndCurrent[],
    unchanged: PreviousAndCurrent[],
    deleted: PreviousAndCurrent[]
}

export interface PlannedMigrations {
    [type: string]: PlannedDiff,

}

export interface LoadedResources {
    [type: string]: TaggedExpression[]
}

export interface LoadedResourcesAndLastMigration {
    migrations: LoadedResources,
    lastMigration: string
}

export interface ReferencedResources {
    [type: string]: ReferencedResource[]
}

export interface MigrationRefAndTimestamp { timestamp: string, ref: any }

export interface TargetCurrentAndSkippedMigrations {
    target: MigrationRefAndTimestamp | null,
    current: MigrationRefAndTimestamp,
    skipped: MigrationRefAndTimestamp[]
}