
import * as beautify from 'js-beautify'

export const prettyPrintExpr = (expr: any) => {
    return beautify.js(expr.toFQL(), { indent_size: 2, keep_array_indentation: true })
}

export const prettyPrintFqlString = (exprStr: any) => {
    return beautify.js(exprStr, { indent_size: 2, keep_array_indentation: true })
}