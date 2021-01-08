import * as fauna from 'faunadb'

const { Update, Delete,
    CreateFunction, CreateCollection, CreateAccessProvider, CreateIndex, CreateRole,
    Role, Function, Collection, Index, AccessProvider } = fauna.query

import { TaggedExpression } from "../types/expressions"
import { ResourceTypes } from '../types/resource-types'

export const transformUpdateToCreate = (expr: TaggedExpression) => {
    if (!expr.type) {
        // could also improve my types instead.
        throw new Error(`Expression type undefined ${expr}`)
    }
    else {
        console.log(expr.fqlExpr.raw.params)
        const obj1 = expr.fqlExpr.raw.params.raw.object
        obj1.name = expr.name
        const fqlFunction = resourceTypeToFqlCreateFunction(expr)
        return toTaggedExpr(expr, fqlFunction(obj1))
    }
}

export const transformCreateToUpdate = (expr: TaggedExpression) => {
    if (!expr.type) {
        // could also improve my types instead.
        throw new Error(`Expression type undefined ${expr}`)
    }
    else {
        return toTaggedExpr(expr,
            Update(
                getReference(<TaggedExpression>expr, resourceTypeToFqlReferenceFunction(expr)),
                expr.fqlExpr.raw["create_" + camelToSnakeCase(expr.type)].raw.object
            )
        )
    }
}

export const transformCreateToDelete = (expr: TaggedExpression) => {
    return toTaggedExpr(expr,
        Delete(
            getReference(<TaggedExpression>expr, resourceTypeToFqlReferenceFunction(expr)),
        )
    )
}


export const transformUpdateToDelete = (expr: TaggedExpression) => {
    return toTaggedExpr(expr,
        Delete(
            getReference(<TaggedExpression>expr, resourceTypeToFqlReferenceFunction(expr)),
        )
    )
}

export const camelToSnakeCase = (str: string) => {
    let snakeCase = str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    if (snakeCase.charAt(0) === '_') {
        snakeCase = snakeCase.substring(1, snakeCase.length)
    }
    return snakeCase
}

export const toTaggedExpr = (taggedExpr: TaggedExpression | undefined, expr: fauna.Expr) => {
    if (taggedExpr === undefined) {
        throw new Error('toTaggedExpr: received undefined expr')
    }
    else {
        return {
            name: taggedExpr.name,
            type: taggedExpr.type,
            fqlExpr: expr
        }
    }
}

const getReference = (taggedExpr: TaggedExpression, fqlFunc: any) => {
    return fqlFunc(taggedExpr.name)
}

const resourceTypeToFqlReferenceFunction = (expr: TaggedExpression) => {
    switch (expr.type) {
        case ResourceTypes.Collection:
            return Collection
        case ResourceTypes.Index:
            return Index
        case ResourceTypes.Function:
            return Function
        case ResourceTypes.Role:
            return Role
        case ResourceTypes.AccessProvider:
            return AccessProvider
        default:
            throw new Error(`Unknown type ${expr.type}`)
    }
}

const resourceTypeToFqlCreateFunction = (expr: TaggedExpression) => {
    switch (expr.type) {
        case ResourceTypes.Collection:
            return CreateCollection
        case ResourceTypes.Index:
            return CreateIndex
        case ResourceTypes.Function:
            return CreateFunction
        case ResourceTypes.Role:
            return CreateRole
        case ResourceTypes.AccessProvider:
            return CreateAccessProvider
        default:
            throw new Error(`Unknown type ${expr.type}`)
    }
}