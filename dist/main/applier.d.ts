import { TaggedExpression } from "../types/expressions";
export interface NameToDependencyNames {
    [type: string]: string[];
}
export interface NameToExpressions {
    [type: string]: TaggedExpression;
}
export interface NameToBool {
    [type: string]: boolean;
}
export interface NameToVar {
    [type: string]: string;
}
export interface DependenciesArrayEl {
    indexedName: string;
    dependencyIndexNames: string[];
}
export declare const applyMigrations: () => Promise<void>;
