import { PatternAndIndexName } from "../types/patterns";
export declare const findStructure: (structure: any, o: any) => string[];
export declare const findStructureIter: (previousKey: string, structure: any, o: any) => string[];
export declare const findPatterns: (o: any, patterns: PatternAndIndexName[]) => string[];
