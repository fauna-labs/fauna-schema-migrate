"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cloneDeep = require('lodash.clonedeep');
var processFun = function (object, key, value) {
    if (value && value.toJSON) {
        object[key] = value.toJSON();
    }
};
var traverse = function (o, func) {
    for (var i in o) {
        func(o, i, o[i]);
        if (o[i] !== null && typeof (o[i]) == "object") {
            traverse(o[i], func);
        }
    }
};
exports.default = (function (obj) {
    try {
        var o = cloneDeep(obj);
        traverse(o, processFun);
        if (o.raw) {
            return o.raw;
        }
        else {
            return o;
        }
    }
    catch (err) {
        console.log(err);
        console.log(obj);
        console.log("failed to parse the JSON of above obj");
    }
});
