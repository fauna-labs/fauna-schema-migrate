import { StatementType } from "./expressions";
export declare enum ResourceTypes {
    Role = "Role",
    Function = "Function",
    Collection = "Collection",
    Index = "Index",
    AccessProvider = "AccessProvider",
    Database = "Database"
}
export interface TypeResult {
    name: string;
    jsonData: any;
    type: ResourceTypes;
    statement: StatementType;
}
