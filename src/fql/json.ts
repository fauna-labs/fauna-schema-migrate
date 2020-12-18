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

const find = (o: any, patAndName: PatternAndIndexName, findFun: any): string[] => {
    let result: string[] = []
    for (var i in o) {
        const found = findFun(o, patAndName.pattern);
        if (found) {
            result.push(patAndName.indexName)
        }
        if (o[i] !== null && typeof (o[i]) == "object") {
            result = result.concat(find(o[i], patAndName, findFun))
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

export const findPattern = (o: any, patterns: PatternAndIndexName[]) => {
    try {
        return patterns
            .map((pattern) => {
                const res = find(o, pattern, equalDeep)
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