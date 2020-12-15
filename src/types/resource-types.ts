import { StatementType } from "./expressions";

// key and value of the enum should remain the same.
export enum ResourceTypes {
    Role = 'Role',
    Function = 'Function'
}

export interface TypeResult {
    name: string
    jsonData: any,
    type: ResourceTypes,
    statement: StatementType
}

