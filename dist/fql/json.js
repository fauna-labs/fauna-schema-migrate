"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPatterns = exports.findStructureIter = exports.findStructure = void 0;
var cloneDeep = require('lodash.clonedeep');
var equalDeep = require('deep-equal');
var toJsonFun = function (object, key, value) {
    if (value && value.toJSON) {
        object[key] = value.toJSON();
    }
};
var traverse = function (o, transformFun) {
    for (var i in o) {
        transformFun(o, i, o[i]);
        if (o[i] !== null && typeof (o[i]) == "object") {
            traverse(o[i], transformFun);
        }
    }
};
// verify same structure, ignoring the values
var sameStructure = function (obj1, obj2) {
    try {
        sameStructureIter(obj1, obj2);
        return true;
    }
    catch (err) {
        if (err.message === 'notequal') {
            return false;
        }
        else {
            throw err;
        }
    }
};
var sameStructureIter = function (obj1, obj2) {
    for (var key in obj1) {
        if (key !== "isFaunaExpr") {
            if (!obj2.hasOwnProperty(key)) {
                throw Error("notequal");
            }
            if (obj1[key] !== null && typeof (obj1[key]) == "object") {
                sameStructureIter(obj1[key], obj2[key]);
            }
        }
        return true;
    }
};
/* Meant to search for JSON patterns, e.g.
 *  - { index: { index: 'nameofindex' }}
 * Each pattern is linked to a unique name which is returned when the pattern is found.
 * Could in theory also be used for other patterns complex
 * Ignore when the previous key was 'object' since that indicates that
 * the json of this FQL was a user defined object.
 */
var findNamedPattern = function (o, patAndName) {
    return findNamedPatternIter('', o, patAndName);
};
var findNamedPatternIter = function (previousKey, o, patAndName) {
    var result = [];
    for (var i in o) {
        var found = equalDeep(o, patAndName.pattern);
        if (found && previousKey !== 'object') {
            result.push(patAndName.indexName);
        }
        if (o[i] !== null && typeof (o[i]) == "object") {
            result = result.concat(findNamedPatternIter(i, o[i], patAndName));
        }
    }
    return result.flat();
};
/* Meant to search for json structures (ignoring values)
 * this function will return the json snippets that were a match
 * with the structure (including the values)
 * we also ignore it when the previous key was 'object' since
 * that indicates that this was a user defined object which accidentally
 * has a fauna keyword
 */
var findStructure = function (structure, o) {
    return exports.findStructureIter('', structure, o);
};
exports.findStructure = findStructure;
var findStructureIter = function (previousKey, structure, o) {
    var result = [];
    if (sameStructure(structure, o) && sameStructure(o, structure)) {
        result.push(o);
    }
    for (var i in o) {
        if (o[i] !== null && typeof (o[i]) == "object") {
            result = result.concat(exports.findStructureIter(i, structure, o[i]));
        }
    }
    return result.flat();
};
exports.findStructureIter = findStructureIter;
var findPatterns = function (o, patterns) {
    try {
        return patterns
            .map(function (pattern) {
            var res = findNamedPattern(o, pattern);
            return res;
        })
            .flat()
            .filter(onlyUnique);
    }
    catch (err) {
        console.error(err);
        console.error(o);
        console.error("failed to find in the JSON of above obj");
        return [];
    }
};
exports.findPatterns = findPatterns;
var onlyUnique = function (value, index, self) {
    return self.indexOf(value) === index;
};
