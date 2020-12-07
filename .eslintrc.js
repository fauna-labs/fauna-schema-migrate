module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: [
        'prettier-standard',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    plugins: [
        'react',
    ],
    rules: {
        'one-var': 0,
        'func-names': 0,
        'prettier/prettier': [
            'error',
            {
                'singleQuote': true,
                'printWidth': 120,
                'semi': false
            }
        ]
    }
}
