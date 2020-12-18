import { StatementType } from "./expressions";

// key and value of the enum should remain the same.
export enum ResourceTypes {
    Role = 'Role',
    Function = 'Function',
    Collection = 'Collection',
    Index = 'Index',
    AccessProvider = 'AccessProvider'
}

export interface TypeResult {
    name: string
    jsonData: any,
    type: ResourceTypes,
    statement: StatementType
}

