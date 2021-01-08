import { PatternAndIndexName } from "../types/patterns";

var cloneDeep = require('lodash.clonedeep')
var equalDeep = require('deep-equal');

const toJsonFun = (object: any, key: string, value: any) => {
    if (value && value.toJSON) {
        object[key] = value.toJSON()
    }
}

const traverse = (o: any, transformFun: any): any => {
    for (var i in o) {
        transformFun(o, i, o[i]);
        if (o[i] !== null && typeof (o[i]) == "object") {
            traverse(o[i], transformFun);
        }
    }
}

// verify same structure, ignoring the values
const sameStructure = (obj1: any, obj2: any): any => {
    try {
        sameStructureIter(obj1, obj2)
        return true
    }
    catch (err) {
        if (err.message === 'notequal') {
            return false
        }
        else {
            throw err
        }
    }
}

const sameStructureIter = (obj1: any, obj2: any): any => {
    for (var key in obj1) {
        if (!obj2.hasOwnProperty(key)) {
            throw Error("notequal")
        }
        if (obj1[key] !== null && typeof (obj1[key]) == "object") {
            sameStructureIter(obj1[key], obj2[key]);
        }
    }
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
    let result: string[] = []
    for (var i in o) {
        const found = equalDeep(o, patAndName.pattern);
        if (found && previousKey !== 'object') {
            result.push(patAndName.indexName)
        }
        if (o[i] !== null && typeof (o[i]) == "object") {
            result = result.concat(findNamedPatternIter(i, o[i], patAndName))
        }
    }
    return result.flat()
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
    const found = sameStructure(structure, o);
    let result = found && previousKey !== 'object' ? [o] : []

    for (var i in o) {
        if (o[i] !== null && typeof (o[i]) == "object") {
            result = result.concat(findStructureIter(i, structure, o[i]))
        }
    }
    return result.flat()
}

export const toJsonDeep = (obj: any) => {
    try {
        let o = cloneDeep(obj)
        traverse(o, toJsonFun)
        if (o.raw) {
            return o.raw
        }
        else {
            return o
        }
    }
    catch (err) {
        console.log(err)
        console.log(obj)
        console.log(`failed to parse the JSON of above obj`)
    }
}

export const findPatterns = (o: any, patterns: PatternAndIndexName[]) => {
    try {
        return patterns
            .map((pattern) => {
                const res = findNamedPattern(o, pattern)
                return res
            })
            .flat()
            .filter(onlyUnique)
    }
    catch (err) {
        console.log(err)
        console.log(o)
        console.log(`failed to find in the JSON of above obj`)
        return []
    }
}



const onlyUnique = (value: any, index: number, self: any) => {
    return self.indexOf(value) === index;
}