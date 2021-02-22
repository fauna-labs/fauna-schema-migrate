import { TaggedExpression } from "../types/expressions";
export declare const toIndexableName: (expr: TaggedExpression) => string;
export declare const toIndexableNameWithDb: (expr: TaggedExpression) => string;
export declare const toIndexableNameFromTypeAndName: (type: string, name: string) => string;
