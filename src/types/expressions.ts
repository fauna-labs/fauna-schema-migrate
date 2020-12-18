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
}

export interface PreviousAndCurrent {
    current?: TaggedExpression,
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