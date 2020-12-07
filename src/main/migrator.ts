import { isCreateUdfExpression } from "../fql/types";

const modifyFqlSnippet = async (s: any) => {
    switch (true) {
        case isCreateUdfExpression(s):
            console.log('udf!')
            break;
        case isCreateUdfExpression(s):
            console.log('role!')
            break;
        default:
            throw new Error(`Unknown snippet type ${s.substring(0, 50)} ...`)
        // code block
    }
}

