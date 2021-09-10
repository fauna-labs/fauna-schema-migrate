// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { PatternAndIndexName } from '../types/patterns'

const cloneDeep = require('lodash.clonedeep')
const equalDeep = require('deep-equal')

const toJsonFun = (object: any, key: string, value: any) => {
    if (value && value.toJSON) {
        object[key] = value.toJSON()
    }
}

const traverse = (o: any, transformFun: any): any => {
    for (const i in o) {
        transformFun(o, i, o[i])
        if (o[i] !== null && typeof o[i] === 'object') {
            traverse(o[i], transformFun)
        }
    }
}

// verify same structure, ignoring the values
const sameStructure = (obj1: any, obj2: any): any => {
    try {
        sameStructureIter(obj1, obj2)
        return true
    } catch (err) {
        if (err.message === 'notequal') {
            return false
        } else {
            throw err
        }
    }
}

const sameStructureIter = (obj1: any, obj2: any): any => {
    // Need a type check for strings per https://github.com/fauna-labs/fauna-schema-migrate/issues/65
    // See also https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/in_operator_no_object
    // If both are strings, return whether they are equal
    if (typeof obj1 === 'string' && typeof obj2 === 'string') {
        if (obj1 === obj2) {
            return true
        } else {
            throw new Error('notequal')
        }
    }
    // If only one is a string, throw an error
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object')
        throw new Error('notequal')
    
    // If neither is a string, keep the original for block
    for (const key in obj1) {
        if (key !== 'isFaunaExpr') {
            if (!(key in obj2)) {
                throw Error('notequal')
            }
            if (obj1[key] !== null && typeof obj1[key] === 'object') {
                return sameStructureIter(obj1[key], obj2[key])
            }
        }
    }
    return true
}

/* Meant to search for JSON patterns, e.g.
 *  - { index: { index: 'nameofindex' }}
 * Each pattern is linked to a unique name which is returned when the pattern is found.
 * Could in theory also be used for other patterns complex
 * Ignore when the previous key was 'object' since that indicates that
 * the json of this FQL was a user defined object.
 */
const findNamedPattern = (o: any, patAndName: PatternAndIndexName): string[] => {
    return findNamedPatternIter('', o, patAndName)
}

const findNamedPatternIter = (previousKey: string, o: any, patAndName: PatternAndIndexName): string[] => {
    let result: any[] = []
    for (const i in o) {
        const found = equalDeep(o, patAndName.pattern)
        if (found && previousKey !== 'object') {
            result.push(patAndName.indexName)
        }
        if (o[i] !== null && typeof o[i] === 'object') {
            result = result.concat(findNamedPatternIter(i, o[i], patAndName))
        }
    }
    return [].concat.apply([], result)
}

/* Meant to search for json structures (ignoring values)
 * this function will return the json snippets that were a match
 * with the structure (including the values)
 * we also ignore it when the previous key was 'object' since
 * that indicates that this was a user defined object which accidentally
 * has a fauna keyword
 */
export const findStructure = (structure: any, o: any): string[] => {
    return findStructureIter('', structure, o)
}

export const findStructureIter = (previousKey: string, structure: any, o: any): string[] => {
    let result: any[] = []

    if (sameStructure(structure, o) && sameStructure(o, structure)) {
        result.push(o)
    }

    for (const i in o) {
        if (o[i] !== null && typeof o[i] === 'object') {
            result = result.concat(findStructureIter(i, structure, o[i]))
        }
    }
    return [].concat.apply([], result)
}

export const findPatterns = (o: any, patterns: PatternAndIndexName[]) => {
    try {
        const res: any[] = patterns.map((pattern) => {
            const res = findNamedPattern(o, pattern)
            return res
        })
        return [].concat.apply([], res).filter(onlyUnique)
    } catch (err) {
        console.error(err)
        console.error(o)
        console.error(`failed to find in the JSON of above obj`)
        return []
    }
}

const onlyUnique = (value: any, index: number, self: any) => {
    return self.indexOf(value) === index
}
