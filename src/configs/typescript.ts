import assert from 'node:assert/strict';

import {
    GLOB_DTS,
    GLOB_JS,
    GLOB_JSX,
    GLOB_TESTS,
} from '../globs';

import { ensurePackages, loadPackages, memoize } from '../utils';

import type { ESLint, Linter } from 'eslint';

import type {
    OptionsComponentExts,
    OptionsFiles,
    OptionsFunctional,
    OptionsLessOpinionated,
    OptionsMode,
    OptionsOverrides,
    OptionsStylistic,
    OptionsTypeScriptParserOptions,
    OptionsTypeScriptWithTypes,
    TypedFlatConfigItem,
} from '../types';

export const typescript = async (
    options: Readonly<
        OptionsLessOpinionated &
        OptionsOverrides &
        OptionsStylistic &
        OptionsTypeScriptWithTypes &
        Required<
            OptionsComponentExts &
            OptionsFiles &
            OptionsFunctional &
            OptionsMode &
            OptionsTypeScriptParserOptions
        >
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        componentExts = [],
        disableTypeAwareRules,
        files,
        filesTypeAware,
        functionalEnforcement,
        lessOpinionated,
        mode,
        overrides,
        overridesTypeAware,
        parserOptions,
        projectRoot,
        stylistic,
        unsafe,
    } = options;

    await ensurePackages(['@typescript-eslint/eslint-plugin', '@typescript-eslint/parser']);

    const [tsEslintPlugin, tsEslintParser] = (await loadPackages([
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
    ])) as [ESLint.Plugin, Linter.Parser];

    const isTypeAware = typeof projectRoot === 'string';

    const stylisticEnabled = stylistic !== false;

    const makeParser = (typeAware: boolean, files: string[], ignores: string[] = []): TypedFlatConfigItem => ({
        name: `moso/typescript/${typeAware ? 'type-aware-parser' : 'parser'}`,
        files,
        ignores,
        languageOptions: {
            parser: memoize(tsEslintParser, '@typescript-eslint/parser'),
            parserOptions: {
                ecmaFeatures: { jsx: true },
                ecmaVersion: 'latest',
                extraFileExtensions: componentExts.map((ext) => `**/*.${ext}`),
                sourceType: 'module',
                jsxPragma: undefined,
                warnOnUnsupportedTypeScriptVersion: true,
                ...(typeAware
                    ? {
                        projectService: true,
                        tsconfigRootDir: projectRoot,
                    }
                    : {
                        project: projectRoot,
                    }
                ),
                ...(parserOptions as Linter.ParserOptions),
            },
        },
    });

    return [
        {
            name: 'moso/typescript/setup',
            plugins: {
                '@typescript-eslint': memoize(tsEslintPlugin, '@typescript-eslint/eslint-plugin'),
            },
        },
        ...((isTypeAware
            ? [
                makeParser(true, filesTypeAware),
                makeParser(false, files, filesTypeAware),
            ]
            : [
                makeParser(false, files),
            ]
        )),
        {
            name: 'moso/typescript/rules',
            files,
            rules: {
                // Disable core ESLint rules that are already checked by the TypeScript compiler
                ...(assert(!Array.isArray(tsEslintPlugin.configs?.['eslint-recommended'])),
                tsEslintPlugin.configs?.['eslint-recommended']?.rules),

                // Recommended @typescript-eslint rules
                ...(assert(!Array.isArray(tsEslintPlugin.configs?.['recommended'])),
                tsEslintPlugin.configs?.['recommended']?.rules),

                // Turning off additional core ESLint rules
                'class-methods-use-this': 'off',
                'consistent-return': 'off',
                'no-array-constructor': 'off',
                'no-extra-boolean-cast': 'off',
                'no-implied-eval': 'off',
                'no-invalid-this': 'off',
                'no-loop-func': 'off',
                'no-loss-of-precision': 'off',
                'no-unused-vars': 'off',
                'no-use-before-define': 'off',
                'no-useless-constructor': 'off',

                // TypeScript
                '@typescript-eslint/ban-ts-comment': [
                    'error',
                    {
                        'ts-ignore': 'allow-with-description',
                    },
                ],
                '@typescript-eslint/class-methods-use-this': 'error',
                '@typescript-eslint/consistent-indexed-object-style': 'error',
                '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
                '@typescript-eslint/consistent-type-imports': [
                    'error',
                    {
                        disallowTypeAnnotations: false,
                        fixStyle: 'inline-type-imports',
                        prefer: 'type-imports',
                    },
                ],
                '@typescript-eslint/explicit-function-return-type': [
                    'off',
                    {
                        allowConciseArrowFunctionExpressionsStartingWithVoid: true,
                        allowExpressions: true,
                        allowHigherOrderFunctions: true,
                        allowTypedFunctionExpressions: true,
                    },
                ],
                '@typescript-eslint/explicit-member-accessibility': 'off',
                '@typescript-eslint/method-signature-style': ['error', 'property'],
                '@typescript-eslint/no-dupe-class-members': 'off',
                '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
                '@typescript-eslint/no-explicit-any': unsafe,
                '@typescript-eslint/no-import-type-side-effects': 'error',
                '@typescript-eslint/no-invalid-this': 'off',
                '@typescript-eslint/no-loop-func': 'error',
                '@typescript-eslint/no-unused-expressions': [
                    'error',
                    {
                        allowShortCircuit: true,
                        allowTaggedTemplates: true,
                        allowTernary: true,
                    },
                ],
                '@typescript-eslint/no-unused-vars': [
                    'error',
                    {
                        argsIgnorePattern: '^_',
                        args: 'none',
                        caughtErrors: 'none',
                        ignoreRestSiblings: true,
                        vars: 'all',
                    },
                ],
                '@typescript-eslint/no-use-before-define': [
                    'error',
                    {
                        classes: true,
                        functions: false,
                        typedefs: true,
                        variables: true,
                    },
                ],
                '@typescript-eslint/no-useless-constructor': 'error',
                '@typescript-eslint/parameter-properties': 'off',
                '@typescript-eslint/prefer-promise-reject-errors': 'error',

                ...(functionalEnforcement !== 'none' && {
                    // Opinionated TypeScript-related Functional
                    'functional/no-mixed-types': 'error',
                    'functional/prefer-property-signatures': 'error',
                    'functional/readonly-type': 'error',
                    'functional/type-declaration-immutability': [
                        'error',
                        {
                            rules: [
                                {
                                    identifiers: 'I?Immutable.+',
                                    immutability: 'Immutable',
                                    comparator: 'AtLeast',
                                },
                                {
                                    identifiers: 'I?ReadonlyDeep.+',
                                    immutability: 'ReadonlyDeep',
                                    comparator: 'AtLeast',
                                },
                                {
                                    identifiers: 'I?Readonly.+',
                                    immutability: 'ReadonlyShallow',
                                    comparator: 'AtLeast',
                                    fixer: [
                                        {
                                            pattern: '^(Array|Map|Set)<(.+)>$',
                                            replace: 'Readonly$1<$2>',
                                        },
                                        {
                                            pattern: '^(.+)$',
                                            replace: 'Readonly<$1>',
                                        },
                                    ],
                                },
                                {
                                    identifiers: 'I?Mutable.+',
                                    immutability: 'Mutable',
                                    comparator: 'AtMost',
                                    fixer: [
                                        {
                                            pattern: '^Readonly(Array|Map|Set)<(.+)>$',
                                            replace: '$1<$2>',
                                        },
                                        {
                                            pattern: '^Readonly<(.+)>$',
                                            replace: '$1',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],

                    // Matching naming-convention rules
                    '@typescript-eslint/naming-convention': [
                        'error',
                        {
                            selector: 'default',
                            format: ['camelCase', 'PascalCase'],
                            leadingUnderscore: 'allow',
                            trailingUnderscore: 'forbid',
                        },
                        {
                            selector: 'variableLike',
                            filter: { regex: '_[^_]+', match: true },
                            format: ['camelCase', 'PascalCase'],
                            prefix: ['mut_', 'Mut_'],
                            leadingUnderscore: 'forbid',
                            trailingUnderscore: 'forbid',
                        },
                        {
                            selector: 'variableLike',
                            format: ['camelCase', 'PascalCase'],
                            leadingUnderscore: 'allow',
                            trailingUnderscore: 'forbid',
                        },
                        {
                            selector: 'variable',
                            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                            prefix: ['mut_', 'Mut_'],
                            leadingUnderscore: 'forbid',
                            trailingUnderscore: 'forbid',
                        },
                        {
                            selector: 'variable',
                            filter: { regex: '^[A-Z0-9_]+$', match: true },
                            format: ['UPPER_CASE'],
                            modifiers: ['const'],
                            leadingUnderscore: 'forbid',
                            trailingUnderscore: 'forbid',
                        },
                        {
                            selector: 'variable',
                            filter: { regex: '^[mM]ut_[^_]+', match: true },
                            format: ['camelCase', 'PascalCase'],
                            modifiers: ['const'],
                            prefix: ['mut_', 'Mut_'],
                            leadingUnderscore: 'forbid',
                            trailingUnderscore: 'forbid',
                        },
                        {
                            selector: 'variable',
                            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                            modifiers: ['const'],
                            leadingUnderscore: 'allow',
                            trailingUnderscore: 'forbid',
                        },
                        {
                            selector: 'variable',
                            format: null,
                            modifiers: ['destructured'],
                        },
                        {
                            selector: ['autoAccessor', 'parameterProperty', 'property'],
                            filter: { regex: '^[A-Z0-9_]+$', match: true },
                            format: ['UPPER_CASE'],
                            leadingUnderscore: 'forbid',
                            trailingUnderscore: 'forbid',
                        },
                        {
                            selector: ['autoAccessor', 'parameterProperty', 'property'],
                            filter: { regex: '^[mM]ut_[^_]+', match: true },
                            format: ['camelCase', 'PascalCase'],
                            prefix: ['mut_', 'Mut_'],
                            leadingUnderscore: 'forbid',
                            trailingUnderscore: 'forbid',
                        },
                        {
                            selector: ['autoAccessor', 'parameterProperty', 'property'],
                            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                            modifiers: ['readonly'],
                            leadingUnderscore: 'allow',
                            trailingUnderscore: 'forbid',
                        },
                        {
                            selector: [
                                'accessor',
                                'classMethod',
                                'typeMethod',
                                'typeProperty',
                            ],
                            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                            leadingUnderscore: 'allow',
                            trailingUnderscore: 'forbid',
                        },
                        {
                            selector: 'enumMember',
                            format: ['PascalCase', 'UPPER_CASE'],
                            leadingUnderscore: 'allow',
                            trailingUnderscore: 'forbid',
                        },
                        {
                            selector: 'typeLike',
                            format: ['PascalCase'],
                            leadingUnderscore: 'allow',
                            trailingUnderscore: 'forbid',
                        },
                        {
                            selector: ['objectLiteralProperty', 'objectLiteralMethod'],
                            format: null,
                        },
                    ],
                }),

                ...(lessOpinionated
                    ? {
                        '@typescript-eslint/no-dynamic-delete': 'off',
                        '@typescript-eslint/no-invalid-void-type': 'off',
                        '@typescript-eslint/no-extraneous-class': 'off',
                        '@typescript-eslint/no-non-null-assertion': 'off',
                        '@typescript-eslint/no-unsafe-declaration-merging': unsafe,
                        '@typescript-eslint/no-unsafe-function-type': unsafe,
                        '@typescript-eslint/triple-slash-reference': 'off',
                        '@typescript-eslint/unified-signatures': 'off',
                    }
                    : {
                        // I like the stricter rules
                        ...(assert(!Array.isArray(tsEslintPlugin.configs?.['strict'])),
                        tsEslintPlugin.configs?.['strict']?.rules),

                        '@moso/no-force-cast-via-top-type': 'error',
                        '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
                    }
                ),

                // Stylistic
                ...(stylisticEnabled && {
                    ...(assert(!Array.isArray(tsEslintPlugin.configs?.['stylistic'])),
                        tsEslintPlugin.configs?.['stylistic']?.rules),

                    '@typescript-eslint/array-type': ['error', { default: 'array-simple', readonly: 'generic' }],

                    '@stylistic/type-annotation-spacing': 'error',
                }),

                ...overrides,
            },
        },
        ...((isTypeAware
            ? [{
                name: 'moso/typescript/rules-type-aware',
                files: filesTypeAware,
                rules: {
                    // Recommended type-checked rules
                    ...(assert(!Array.isArray(tsEslintPlugin.configs?.['recommended-type-checked-only'])),
                    tsEslintPlugin.configs?.['recommended-type-checked-only']?.rules),

                    // JS off
                    'no-implied-val': 'off',
                    'only-throw-error': 'off',
                    'prefer-destructuring': 'off',
                    'prefer-promise-reject-errors': 'off',
                    'require-await': 'off',

                    '@typescript-eslint/consistent-return': 'error',
                    '@typescript-eslint/consistent-type-exports': 'error',

                    // Enforcing somewhat proper naming convention if Functional is disabled
                    ...(functionalEnforcement === 'none' && {
                        '@typescript-eslint/naming-convention': [
                            'error',
                            {
                                selector: 'default',
                                format: ['camelCase', 'PascalCase'],
                                leadingUnderscore: 'allow',
                                trailingUnderscore: 'forbid',
                            },
                            {
                                selector: 'variableLike',
                                format: ['camelCase', 'PascalCase'],
                                leadingUnderscore: 'allow',
                                trailingUnderscore: 'forbid',
                            },
                            {
                                selector: 'variable',
                                filter: { regex: '^[A-Z0-9_]+$', match: true },
                                format: ['UPPER_CASE'],
                                modifiers: ['const'],
                                leadingUnderscore: 'forbid',
                                trailingUnderscore: 'forbid',
                            },
                            {
                                selector: 'variable',
                                format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                                modifiers: ['const'],
                                leadingUnderscore: 'allow',
                                trailingUnderscore: 'forbid',
                            },
                            {
                                selector: 'variable',
                                format: null,
                                modifiers: ['destructured'],
                            },
                            {
                                selector: ['autoAccessor', 'parameterProperty', 'property'],
                                filter: { regex: '^[A-Z0-9_]+$', match: true },
                                format: ['UPPER_CASE'],
                                leadingUnderscore: 'forbid',
                                trailingUnderscore: 'forbid',
                            },
                            {
                                selector: ['autoAccessor', 'parameterProperty', 'property'],
                                format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                                modifiers: ['readonly'],
                                leadingUnderscore: 'allow',
                                trailingUnderscore: 'forbid',
                            },
                            {
                                selector: [
                                    'accessor',
                                    'classMethod',
                                    'typeMethod',
                                    'typeProperty',
                                ],
                                format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                                leadingUnderscore: 'allow',
                                trailingUnderscore: 'forbid',
                            },
                            {
                                selector: 'enumMember',
                                format: ['PascalCase', 'UPPER_CASE'],
                                leadingUnderscore: 'allow',
                                trailingUnderscore: 'forbid',
                            },
                            {
                                selector: 'typeLike',
                                format: ['PascalCase'],
                                leadingUnderscore: 'allow',
                                trailingUnderscore: 'forbid',
                            },
                            {
                                selector: ['objectLiteralProperty', 'objectLiteralMethod'],
                                format: null,
                            },
                        ],
                    }),

                    '@typescript-eslint/no-unnecessary-qualifier': 'error',
                    '@typescript-eslint/no-unnecessary-type-conversion': 'error',

                    '@typescript-eslint/prefer-readonly': 'error',
                    // '@typescript-eslint/prefer-readonly-parameter-types': 'error',
                    '@typescript-eslint/promise-function-async': 'error',
                    '@typescript-eslint/require-array-sort-compare': 'error',
                    '@typescript-eslint/return-await': ['error', 'in-try-catch'],
                    '@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],

                    ...(lessOpinionated
                        ? {
                            '@typescript-eslint/no-unsafe-argument': unsafe,
                            '@typescript-eslint/no-unsafe-assignment': unsafe,
                            '@typescript-eslint/no-unsafe-call': unsafe,
                            '@typescript-eslint/no-unsafe-enum-comparison': unsafe,
                            '@typescript-eslint/no-unsafe-member-access': unsafe,
                            '@typescript-eslint/no-unsafe-return': unsafe,
                            // '@typescript-eslint/no-unsafe-type-assertion': unsafe,
                            '@typescript-eslint/no-unsafe-unary-minus': unsafe,
                        }
                        : {
                            // I like the strict rules
                            ...(assert(!Array.isArray(tsEslintPlugin.configs?.['strict-type-checked-only'])),
                            tsEslintPlugin.configs?.['strict-type-checked-only']?.rules),

                            // Strict overrides
                            '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
                            '@typescript-eslint/no-confusing-void-expression': [
                                'error',
                                {
                                    ignoreArrowShorthand: false,
                                    ignoreVoidOperator: true,
                                    ignoreVoidReturningFunctions: true,
                                },
                            ],
                            '@typescript-eslint/no-meaningless-void-operator': ['error', { checkNever: true }],
                            '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
                            '@typescript-eslint/only-throw-error': [
                                'error',
                                {
                                    allowRethrowing: true,
                                    allowThrowingAny: true,
                                    allowThrowingUnknown: false,
                                },
                            ],
                            '@typescript-eslint/restrict-plus-operands': [
                                'error',
                                {
                                    allowAny: true,
                                    allowBoolean: false,
                                    allowNullish: false,
                                    allowNumberAndString: false,
                                    allowRegExp: false,
                                    skipCompoundAssignments: true,
                                },
                            ],
                            '@typescript-eslint/restrict-template-expressions': [
                                'error',
                                {
                                    allowAny: true,
                                    allowArray: true,
                                    allowBoolean: true,
                                    allowNever: false,
                                    allowNullish: true,
                                    allowNumber: true,
                                    allowRegExp: false,
                                },
                            ],
                            '@typescript-eslint/return-await': ['error', 'in-try-catch'],

                            // Opinionated rules
                            '@typescript-eslint/prefer-destructuring': [
                                'error',
                                {
                                    VariableDeclarator: { array: false, object: true },
                                    AssignmentExpression: { array: true, object: true },
                                },
                                { enforceForRenamedProperties: false },
                            ],
                            '@typescript-eslint/strict-boolean-expressions': [
                                'error',
                                {
                                    allowNullableBoolean: true,
                                    allowNullableObject: true,
                                },
                            ],
                            '@typescript-eslint/switch-exhaustiveness-check': [
                                'error',
                                {
                                    allowDefaultCaseForExhaustiveSwitch: true,
                                    considerDefaultExhaustiveForUnions: true,
                                },
                            ],
                        }
                    ),

                    // Recommended TypeScript type-checked stylistic rules
                    ...(stylisticEnabled && {
                        ...(assert(!Array.isArray(tsEslintPlugin.configs?.['stylistic-type-checked-only'])),
                        tsEslintPlugin.configs?.['stylistic-type-checked-only']?.rules),

                        // Stylistic overrides
                        '@typescript-eslint/dot-notation': [
                            'error',
                            {
                                allowIndexSignaturePropertyAccess: true,
                                allowKeywords: true,
                            },
                        ],
                    }),

                    ...overridesTypeAware,
                },
            }]
            : []) satisfies TypedFlatConfigItem[]
        ),
        ...((disableTypeAwareRules
            ? [{
                name: 'moso/typescript/rules-disable-type-aware',
                files,
                rules: {
                    ...(assert(!Array.isArray(tsEslintPlugin.configs?.['disable-type-checked'])),
                    tsEslintPlugin.configs?.['disable-type-checked']?.rules),
                },
            }]
            : []) satisfies TypedFlatConfigItem[]
        ),
        ...((mode === 'application'
            ? [{
                name: 'moso/typescript/application-mode',
                rules: {
                    '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
                },
            }]
            : []) satisfies TypedFlatConfigItem[]
        ),
        {
            name: 'moso/typescript/dts-overrides',
            files: [GLOB_DTS],
            rules: {
                '@eslint-community/eslint-comments/no-unlimited-disable': 'off',
                '@stylistic/quote-props': 'off',
                'no-duplicate-imports': 'off',
                'no-restricted-syntax': 'off',
                'unused-imports/no-unused-vars': 'off',
            },
        },
        {
            name: 'moso/typescript/test-overrides',
            files: [GLOB_TESTS],
            rules: {
                '@typescript-eslint/consistent-type-definitions': 'off',
                '@typescript-eslint/no-unused-expressions': 'off',
                '@typescript-eslint/triple-slash-reference': 'off',
                'no-unused-expressions': 'off',
            },
        },
        {
            name: 'moso/typescript/javascript-overrides',
            files: [GLOB_JS, GLOB_JSX],
            rules: {
                '@typescript-eslint/ban-ts-comment': 'off',
                '@typescript-eslint/no-require-imports': 'off',
            },
        },
    ];
};
