import { TaggedExpression, LoadedResources, PlannedDiffPerResource } from "../types/expressions";
export declare const retrieveDatabasesDiff: (currentDbs: string[][], targetDbs: string[][]) => Promise<TaggedExpression[]>;
export declare const retrieveDiff: (currentExpressions: LoadedResources, targetExpressions: LoadedResources) => PlannedDiffPerResource;
export declare const transformDiffToExpressions: (diff: PlannedDiffPerResource) => TaggedExpression[];
