module.exports = {
    env: {
        es6: true,
        browser: true,
        jest: true,
        node: true
    },
    plugins: [
        '@typescript-eslint'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        }
    },
    extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        '@moso/eslint-config-basic',
        'plugin:import/typescript'
    ],
    settings: {
        react: {
            pragma: 'React',
            version: 'detect'
        },
        'import/resolver': {
            node: {
                extensions: ['.js', '.mjs', '.jsx', '.ts', '.tsx']
            }
        }
    },
    rules: {
        // ES6
        'comma-dangle': ['error', 'always-multiline'],
        'no-console': [2, { allow: ['warn', 'error'] }],
        'no-redeclare': 'off',
        'no-useless-constructor': 'off',
        semi: [2, 'always'],

        // React
        'react/display-name': 'off',
        'react/no-deprecated': 'error',
        'react/no-unescaped-entities': 'error',
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',

        // JSX
        'react/jsx-curly-newline': 'consistent',
        'react/jsx-equals-spacing': [2, 'always'],
        'react/jsx-indent': [4, 2, { indentLogicalExpressions: true }],
        'react/jsx-props-no-multi-spaces': 'error',

        // TS
        '@typescript-eslint/indent': ['error', 4],
        '@typescript-eslint/member-delimiter-style': ['error', { multiline: { delimiter: 'none' } }],
        '@typescript-eslint/no-redeclare': 'error',
        '@typescript-eslint/no-unused-vars': [2, { argsIgnorePattern: '^_', args: 'none', ignoreRestSiblings: true }],
        '@typescript-eslint/semi': ['error', 'always'],
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
        '@typescript-eslint/no-parameter-properties': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-var-requires': 'off'
    }
}
