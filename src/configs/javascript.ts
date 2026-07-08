import assert from 'node:assert/strict';

import globals from 'globals';

import mosoPlugin from '../rules';
import { loadPackages, memoize } from '../utils';

import type { ESLint } from 'eslint';

import type {
    OptionsFunctional,
    OptionsIsInEditor,
    OptionsLessOpinionated,
    OptionsOverrides,
    OptionsPerfectionist,
    TypedFlatConfigItem,
} from '../types';

const useNumberIsFinite = 'Please use `Number.isFinite` instead.';
const useNumberIsNan = 'Please use `Number.isNaN` instead.';
const useObjectDefineProperty = 'Please use `Object.defineProperty` instead.';

export const javascript = async (
    options: Readonly<
        OptionsIsInEditor &
        OptionsLessOpinionated &
        OptionsOverrides &
        OptionsPerfectionist &
        Required<OptionsFunctional>
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        functionalEnforcement,
        isInEditor,
        lessOpinionated,
        overrides,
        perfectionist,
    } = options;

    const [
        deMorganPlugin,
        eslintJs,
        unusedImportsPlugin,
    ] = (await loadPackages([
        'eslint-plugin-de-morgan',
        '@eslint/js',
        'eslint-plugin-unused-imports',
    ])) as [
        (typeof import('eslint-plugin-de-morgan')),
        typeof import('@eslint/js'),
        ESLint.Plugin,
    ];

    return [
        {
            name: 'moso/javascript',
            languageOptions: {
                ecmaVersion: 'latest',
                globals: {
                    ...globals.browser,
                    ...globals.es2026,
                    ...globals.node,
                    document: 'readonly',
                    navigator: 'readonly',
                    window: 'readonly',
                },
                parserOptions: {
                    ecmaFeatures: { jsx: true },
                    ecmaVersion: 'latest',
                    sourceType: 'module',
                },
                sourceType: 'module',
            },
            linterOptions: {
                reportUnusedDisableDirectives: true,
            },
            plugins: {
                '@eslint/js': memoize(eslintJs, '@eslint/js'),
                'unused-imports': memoize(unusedImportsPlugin, 'eslint-plugin-unused-imports'),
            },
            rules: {
                // ESLint's recommended rules for JavaScript
                // @see https://eslint.org/docs/latest/rules
                ...(assert.ok(!Array.isArray(eslintJs.configs.recommended)),
                eslintJs.configs.recommended.rules),

                // Problems
                'array-callback-return': ['error', { allowImplicit: true }],
                'getter-return': ['error', { allowImplicit: true }],
                'no-await-in-loop': 'error',
                'no-cond-assign': ['error', 'always'],
                'no-constructor-return': 'error',
                'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
                'no-fallthrough': ['warn', { commentPattern: 'break[\\s\\w]*omitted' }],
                'no-inner-declarations': ['error', 'functions'],
                'no-promise-executor-return': ['error', { allowVoid: true }],
                'no-self-assign': ['error', { props: true }],
                'no-self-compare': 'error',
                'no-template-curly-in-string': 'error',
                'no-unmodified-loop-condition': 'error',
                'no-unreachable-loop': 'error',
                'no-use-before-define': [
                    'error',
                    {
                        classes: true,
                        functions: false,
                        variables: true,
                    },
                ],
                'require-atomic-updates': 'error',
                'use-isnan': ['error', { enforceForIndexOf: true, enforceForSwitchCase: true }],
                'valid-typeof': ['error', { requireStringLiterals: true }],

                // Suggestions
                'accessor-pairs': ['error', { enforceForClassMembers: true, setWithoutGet: true }],
                'arrow-body-style': ['error', 'as-needed'],
                'block-scoped-var': 'error',
                'camelcase': 'off',
                'class-methods-use-this': 'error',
                'consistent-return': ['error', { treatUndefinedAsUnspecified: false }],
                'consistent-this': 'off',
                'curly': ['error', 'multi-or-nest'],
                'default-case-last': 'error',
                'dot-notation': ['warn', { allowKeywords: true }],
                'eqeqeq': ['error', 'smart'],
                'func-name-matching': 'error',
                'func-style': [
                    'error',
                    'declaration',
                    {
                        allowArrowFunctions: true,
                    },
                ],
                'grouped-accessor-pairs': 'error',
                'guard-for-in': 'error',
                'new-cap': [
                    'error',
                    {
                        capIsNew: false,
                        newIsCap: true,
                        properties: true,
                    },
                ],
                'no-alert': 'error',
                'no-array-constructor': 'error',
                'no-caller': 'error',
                'no-console': ['error', { allow: ['warn', 'error'] }],
                'no-else-return': ['error', { allowElseIf: false }],
                'no-empty': ['error', { allowEmptyCatch: true }],
                'no-eq-null': 'error',
                'no-eval': 'error',
                'no-extra-bind': 'error',
                'no-implied-eval': 'error',
                'no-invalid-this': 'error',
                'no-iterator': 'error',
                'no-label-var': 'error',
                'no-labels': ['error', { allowLoop: true, allowSwitch: true }],
                'no-lone-blocks': 'error',
                'no-lonely-if': 'error',
                'no-loop-func': 'error',
                'no-multi-assign': 'error',
                'no-multi-str': 'error',
                'no-new': 'error',
                'no-new-func': 'error',
                'no-new-wrappers': 'error',
                'no-object-constructor': 'error',
                'no-octal-escape': 'error',
                'no-param-reassign': 'error',
                'no-proto': 'error',
                'no-redeclare': ['error', { builtinGlobals: true }],
                'no-restricted-globals': [
                    'error',
                    { message: 'Use local parameter instead.', name: 'event' },
                    { message: 'Use `globalThis` instead.', name: 'global' },
                    { message: 'Use `globalThis` instead.', name: 'self' },
                    { message: 'Use `globalThis` instead.', name: 'window' },
                ],
                'no-restricted-properties': [
                    'error',
                    { message: 'Use `Object.getOwnPropertyDescriptor` instead.', property: '__lookupGetter__' },
                    { message: 'Use `Object.getOwnPropertyDescriptor` instead.', property: '__lookupSetter__' },
                    { message: 'Use `Object.getPrototypeOf` or `Object.setPrototypeOf` instead.', property: '__proto__' },
                    {
                        message: 'arguments.callee is deprecated',
                        object: 'arguments',
                        property: 'callee',
                    },
                    {
                        message: useNumberIsFinite,
                        object: 'global',
                        property: 'isFinite',
                    },
                    {
                        message: useNumberIsFinite,
                        object: 'self',
                        property: 'isFinite',
                    },
                    {
                        message: useNumberIsFinite,
                        object: 'window',
                        property: 'isFinite',
                    },
                    {
                        message: useNumberIsNan,
                        object: 'global',
                        property: 'isNaN',
                    },
                    {
                        message: useNumberIsNan,
                        object: 'self',
                        property: 'isNaN',
                    },
                    {
                        message: useNumberIsNan,
                        object: 'window',
                        property: 'isNaN',
                    },
                    { message: useObjectDefineProperty, property: '__defineGetter__' },
                    { message: useObjectDefineProperty, property: '__defineSetter__' },
                ],
                'no-restricted-syntax': [
                    'error',
                    {
                        message: 'Don\'t use "void".',
                        selector: ':not(ArrowFunctionExpression) > UnaryExpression[operator="void"] > :not(CallExpression)',
                    },
                    {
                        message: '`for..in` loops iterate over the entire prototype chain, which is virtually never what you want. Use `Object.{keys,values,entries}`, and iterate over the resulting array.',
                        selector: 'ForInStatement',
                    },
                    {
                        message: 'Labeled statements are not allowed.',
                        selector: 'LabeledStatement',
                    },
                    {
                        message: 'Const enums are forbidden to increase interoperability. Use regular enums instead.',
                        selector: 'TSEnumDeclaration[const=true]',
                    },
                    {
                        message: 'TypeScript\'s own parser uses `ExportAssignment` for both `export default` and `export =`.',
                        selector: 'TSExportAssignment',
                    },
                    {
                        message: '`with` is disallowed in strict mode because it makes code impossoble to predict and optimize.',
                        selector: 'WithStatement',
                    },

                ],
                'no-return-assign': 'off',
                'no-sequences': 'error',
                'no-throw-literal': 'error',
                'no-undef-init': 'error',
                'no-unneeded-ternary': ['error', { defaultAssignment: false }],
                'no-unused-expressions': [
                    'error',
                    {
                        allowShortCircuit: true,
                        allowTaggedTemplates: true,
                        allowTernary: true,
                    },
                ],
                'no-useless-call': 'error',
                'no-useless-computed-key': 'error',
                'no-useless-concat': 'error',
                'no-useless-constructor': 'error',
                'no-useless-rename': 'error',
                'no-var': 'error',
                'object-shorthand': [
                    'error',
                    'always',
                    {
                        avoidQuotes: true,
                        ignoreConstructors: false,
                    },
                ],
                'one-var': [
                    'error',
                    {
                        const: 'never',
                        let: 'never',
                        var: 'never',
                    },
                ],
                'operator-assignment': ['error', 'always'],
                'prefer-arrow-callback': [
                    'error',
                    {
                        allowNamedFunctions: false,
                        allowUnboundThis: true,
                    },
                ],
                'prefer-const': [
                    'error',
                    {
                        destructuring: 'all',
                        ignoreReadBeforeAssign: true,
                    },
                ],
                'prefer-destructuring': [
                    'error',
                    {
                        VariableDeclarator: { array: false, object: true },
                        AssignmentExpression: { array: true, object: true },
                    },
                    { enforceForRenamedProperties: false },
                ],
                'prefer-exponentiation-operator': 'error',
                'prefer-numeric-literals': 'error',
                'prefer-object-has-own': 'error',
                'prefer-object-spread': 'error',
                'prefer-promise-reject-errors': 'error',
                'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
                'prefer-rest-params': 'error',
                'prefer-spread': 'error',
                'prefer-template': 'error',
                'radix': 'error',
                'require-await': 'error',
                'require-unicode-regexp': 'error',
                'strict': ['error', 'never'],
                'symbol-description': 'error',
                'vars-on-top': 'error',
                'yoda': ['error', 'never'],

                // Layout & formatting
                'unicode-bom': ['error', 'never'],

                // Unused Imports
                'unused-imports/no-unused-imports': isInEditor ? 'warn' : 'error',
                'unused-imports/no-unused-vars': [
                    'error',
                    {
                        args: 'after-used',
                        argsIgnorePattern: '^_',
                        ignoreRestSiblings: true,
                        vars: 'all',
                        varsIgnorePattern: '^_',
                    },
                ],

                // Functional settings
                ...(functionalEnforcement === 'none'
                    ? {
                        'max-classes-per-file': ['error', 1],
                    }
                    : {
                        'no-param-reassign': [
                            'error',
                            functionalEnforcement === 'lite'
                                ? { props: false }
                                : { props: true, ignorePropertyModificationsForRegex: ['^[mM]ut_'] },
                        ],
                    }
                ),

                // Sorting enabled if Perfectionist is disabled
                ...(!perfectionist && {
                    'sort-imports': [
                        'error',
                        {
                            allowSeparatedGroups: false,
                            ignoreCase: false,
                            ignoreDeclarationSort: true,
                            ignoreMemberSort: false,
                            memberSyntaxSortOrder: [
                                'none',
                                'all',
                                'multiple',
                                'single',
                            ],
                        },
                    ],
                }),

                ...overrides,
            },
        },
        ...((lessOpinionated
            ? []
            : [
                {
                    name: 'moso/javascript/opinionated',
                    plugins: {
                        '@moso': memoize(mosoPlugin, '@moso/eslint-plugin'),
                        'de-morgan': memoize(deMorganPlugin, 'eslint-plugin-de-morgan'),
                    },
                    rules: {
                        // Own rules
                        '@moso/avoid-barrel-files': ['error', { amountOfExportsToConsiderModuleAsBarrel: 5 }],
                        '@moso/no-bidi': 'error',
                        '@moso/no-invisible-characters': 'error',
                        '@moso/no-redundant-variable': 'error',
                        '@moso/no-string-interpolation': 'error',
                        '@moso/no-top-level-await': 'error',
                        '@moso/no-unneeded-array-flat-map': 'error',
                        '@moso/prefer-early-return': ['error', { maximumStatements: 1 }],
                        '@moso/prefer-fetch': 'error',
                        '@moso/prefer-reduce-over-chaining': 'error',

                        // eslint-plugin-de-morgan rules
                        // @see https://github.com/azat-io/eslint-plugin-de-morgan
                        'de-morgan/no-negated-conjunction': 'error',
                        'de-morgan/no-negated-disjunction': 'error',
                    },
                },
            ]) satisfies TypedFlatConfigItem[]
        ),
    ];
};
