module.exports = {
    plugins: [
        '@typescript-eslint'
    ],
    parser: '@typescript-eslint/parser',
    extends: [
        '@moso/eslint-config-basic',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript'
    ],
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.mjs', '.jsx', '.ts', '.tsx']
            }
        }
    },
    rules: {
        // ES6
        'no-redeclare': 'off',
        'no-unused-vars': 'off',
        'no-useless-constructor': 'off',

        // TS
        '@typescript-eslint/indent': ['error', 4],
        '@typescript-eslint/member-delimiter-style': ['error', { multiline: { delimiter: 'none' } }],
        '@typescript-eslint/no-redeclare': 'error',
        '@typescript-eslint/no-unused-vars': [2, { args: 'none', ignoreRestSiblings: true }],
        '@typescript-eslint/semi': ['error', 'never'],
        '@typescript-eslint/type-annotation-spacing': ['error', {}],

        // TS off
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-parameter-properties': 'off'
    }
}
