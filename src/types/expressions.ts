export interface TaggedExpression {
    name: string,
    type?: string,
    fqlExpr?: any,
    json?: any,
    jsonData?: any,
    fql?: string,
    fqlFormatted?: string
}

export interface LocalAndRemote {
    local?: TaggedExpression,
    remote?: TaggedExpression
}

export interface PlannedDiff {
    added: LocalAndRemote[],
    changed: LocalAndRemote[],
    unchanged: LocalAndRemote[],
    deleted: LocalAndRemote[]
}

export interface PlannedMigrations {
    collections: PlannedDiff,
    indexes: PlannedDiff,
    databases: PlannedDiff,
    roles: PlannedDiff,
    functions: PlannedDiff,
    accessproviders: PlannedDiff
}

export interface LoadedResources {
    collections: TaggedExpression[],
    indexes: TaggedExpression[],
    databases: TaggedExpression[],
    roles: TaggedExpression[],
    functions: TaggedExpression[],
    accessproviders: TaggedExpression[],
    [_: string]: TaggedExpression[]
}