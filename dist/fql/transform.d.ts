import * as fauna from 'faunadb';
import { StatementType, TaggedExpression } from "../types/expressions";
import { ResourceTypes } from '../types/resource-types';
export declare const createStub: (expr: TaggedExpression) => {
    name: string;
    type: any;
    fqlExpr: fauna.Expr;
    fql: any;
    statement: StatementType;
    jsonData: any;
    db: string[];
};
export declare const transformUpdateToCreate: (expr: TaggedExpression) => {
    name: string;
    type: any;
    fqlExpr: fauna.Expr;
    fql: any;
    statement: StatementType;
    jsonData: any;
    db: string[];
};
export declare const explicitelySetAllParameters: (expr: TaggedExpression) => {
    name: string;
    type: any;
    fqlExpr: fauna.Expr;
    fql: any;
    statement: StatementType;
    jsonData: any;
    db: string[];
};
export declare const transformCreateToUpdate: (expr: TaggedExpression) => {
    name: string;
    type: any;
    fqlExpr: fauna.Expr;
    fql: any;
    statement: StatementType;
    jsonData: any;
    db: string[];
};
export declare const transformCreateToDelete: (expr: TaggedExpression) => {
    name: string;
    type: any;
    fqlExpr: fauna.Expr;
    fql: any;
    statement: StatementType;
    jsonData: any;
    db: string[];
};
export declare const transformUpdateToUpdate: (expr: TaggedExpression) => {
    name: string;
    type: any;
    fqlExpr: fauna.Expr;
    fql: any;
    statement: StatementType;
    jsonData: any;
    db: string[];
};
export declare const transformUpdateToDelete: (expr: TaggedExpression) => {
    name: string;
    type: any;
    fqlExpr: fauna.Expr;
    fql: any;
    statement: StatementType;
    jsonData: any;
    db: string[];
};
export declare const transformDbPathToCreate: (childDbPath: string[]) => TaggedExpression;
export declare const transformDbPathToUpdate: (childDbPath: string[]) => TaggedExpression;
export declare const transformDbPathToDelete: (childDbPath: string[]) => TaggedExpression;
export declare const transformDbNameToFqlGeneric: (name: string, db: string[], s: StatementType, fqlExpr: any) => TaggedExpression;
export declare const camelToSnakeCase: (str: string) => string;
export declare const toTaggedExpr: (taggedExpr: TaggedExpression | undefined, fqlExpr: fauna.Expr, statement: StatementType) => {
    name: string;
    type: any;
    fqlExpr: fauna.Expr;
    fql: any;
    statement: StatementType;
    jsonData: any;
    db: string[];
};
export declare const getJsonData: (fExpr: fauna.Expr, resourceType: ResourceTypes, statement: StatementType) => any;
