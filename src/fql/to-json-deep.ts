var cloneDeep = require('lodash.clonedeep')

var o = {
    foo: "bar",
    arr: [1, 2, 3],
    subo: {
        foo2: "bar2"
    }
};

const processFun = (object: any, key: string, value: any) => {
    if (value.raw) {
        object[key] = value.raw
    }
}

const traverse = (o: any, func: any) => {
    for (var i in o) {
        func(o, i, o[i]);
        if (o[i] !== null && typeof (o[i]) == "object") {
            traverse(o[i], func);
        }
    }
    if (o.raw) {
        return o.raw
    }
}

export default (obj: any) => {
    let o = cloneDeep(obj)
    return traverse(o, processFun)
}