var cloneDeep = require('lodash.clonedeep')

const processFun = (object: any, key: string, value: any) => {
    if (value && value.toJSON) {
        object[key] = value.toJSON()
    }
}

const traverse = (o: any, func: any): any => {
    for (var i in o) {
        func(o, i, o[i]);
        if (o[i] !== null && typeof (o[i]) == "object") {
            traverse(o[i], func);
        }
    }
}

export default (obj: any) => {
    try {
        let o = cloneDeep(obj)
        traverse(o, processFun)
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