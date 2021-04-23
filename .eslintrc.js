// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

module.exports = {
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'standard',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['ava', 'react', '@typescript-eslint', 'prettier'],
  rules: {
    'one-var': 0,
    'func-names': 0,
    'prettier/prettier': 'error',
    // This library is not using proptypes
    'react/prop-types': 'off',
    'no-use-before-define': 'off',
    // TODO:
    // The following configuration is meant as a quick fix to actually pass the linting step.
    // I have solved most quick fixes myself but I don't have the time right now to do them all.
    // Someone with more indepth knowledge of the library should go through them and try to fix
    // the errors and remove these rules afterwards.
    // More specifig overrides are in the `overrides` section below
    // All temporary rules are marked with `@tmp`
    'prefer-spread': 'warn', // @tmp
    '@typescript-eslint/no-var-requires': 'warn', // @tmp
    'react/display-name': 'warn', // @tmp
    'no-async-promise-executor': 'warn', // @tmp
  },
  overrides: [
    {
      files: ['tests/**/*test.ts'],
      rules: {
        // TODO: remove
        '@typescript-eslint/no-explicit-any': 'off', // @tmp
        // Sometimes you just don't need ava's `t` and eslint would flag it as unused
        '@typescript-eslint/no-unused-vars': 'off', // @tmp
      },
    },
    {
      // TODO:
      // Look at these files and decide if it can be converted to use `import`
      files: ['tests/general/multi_update_noop/resources*/create_function.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off', // @tmp
        'no-undef': 'off', // @tmp
      },
    },
  ],
}
