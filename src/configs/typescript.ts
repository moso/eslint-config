import process from 'node:process';

import { GLOB_SRC, GLOB_TS, GLOB_TSX } from '@/globs';
import { interopDefault, toArray } from '@/utils';

import type {
    OptionsComponentExts,
    OptionsFiles,
    OptionsOverrides,
    OptionsTypeScriptParserOptions,
    OptionsTypeScriptWithTypes,
    TypedFlatConfigItem
} from '@/types';

export const typescript = async (options:
    OptionsFiles &
    OptionsComponentExts &
    OptionsOverrides &
    OptionsTypeScriptWithTypes &
    OptionsTypeScriptParserOptions = {},
): Promise<TypedFlatConfigItem[]>  => {
    const {
        componentExts = [],
        overrides = {},
        parserOptions = {},
    } = options;

    const files = options.files ?? [
        GLOB_SRC,
        ...componentExts.map(ext => `**/*.${ext}`),
    ];

    const filesTypeAware = options.filesTypeAware ?? [GLOB_TS, GLOB_TSX];
    const tsconfigPath = options?.tsconfigPath
        ? toArray(options.tsconfigPath)
        : undefined;
    const isTypeAware = !!tsconfigPath;

    const typeAwareRules: TypedFlatConfigItem['rules'] = {
        '@stylistic/await-thenable': 'error',
        '@stylistic/dot-notation': ['error', { allowKeywords: true }],
        '@stylistic/no-floating-promises': 'error',
        '@stylistic/no-for-in-array': 'error',
        '@stylistic/no-implied-eval': 'error',
        '@stylistic/no-misused-promises': 'error',
        '@stylistic/no-throw-literal': 'error',
        '@stylistic/no-unnecessary-type-assertion': 'error',
        '@stylistic/no-unsafe-argument': 'error',
        '@stylistic/no-unsafe-assignment': 'error',
        '@stylistic/no-unsafe-call': 'error',
        '@stylistic/no-unsafe-member-access': 'error',
        '@stylistic/no-unsafe-return': 'error',
        '@stylistic/restrict-plus-operands': 'error',
        '@stylistic/restrict-template-expressions': 'error',
        '@stylistic/unbound-method': 'error',
    };

    const [
        antfuPlugin,
        stylisticPlugin,
        tsParser,
    ] = await Promise.all([
        interopDefault(import('eslint-plugin-antfu')),
        interopDefault(import('@stylistic/eslint-plugin')),
        interopDefault(import('@typescript-eslint/parser')),
    ] as const);

    const makeParser = (typeAware: boolean, files: string[], ignores?: string[]): TypedFlatConfigItem => {
        return {
            files,
            ...ignores ? { ignores } : {},
            languageOptions: {
                parser: tsParser,
                parserOptions: {
                    extraFileExtensions: componentExts.map(ext => `.${ext}`),
                    sourceType: 'module',
                    ...typeAware ? {
                        project: tsconfigPath,
                        tsconfigRootDir: process.cwd(),
                    } : {},
                    ...parserOptions as any,
                },
            },
            name: `moso/typescript/${typeAware ? 'type-aware-parser' : 'parser'}`,
        };
    };

    return [
        {
            name: 'moso/typescript/setup',
            plugins: {
                antfu: antfuPlugin,
                '@stylistic': stylisticPlugin,
            },
        },
        ...isTypeAware
        ? [
            makeParser(true, filesTypeAware),
            makeParser(false, files, filesTypeAware),
        ]
        : [makeParser(false, files)],
        {
            files,
            name: 'moso/typescript/rules',
            rules: {
                '@stylistic/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
                '@stylistic/ban-ts-ignore': 0,
                '@stylistic/ban-types': ['error', { types: { Function: false } }],
                '@stylistic/consistent-type-definitions': ['error', 'interface'],
                '@stylistic/consistent-type-imports': ['error', { disallowTypeAnnotations: false, prefer: 'type-imports' }],
                '@stylistic/method-signature-style': ['error', 'property'], // https://www.totaltypescript.com/method-shorthand-syntax-considered-harmful
                '@stylistic/no-dupe-class-members': 'error',
                '@stylistic/no-dynamic-delete': 0,
                '@stylistic/no-explicit-any': 0,
                '@stylistic/no-extraneous-class': 0,
                '@stylistic/no-import-type-side-effects': 'error',
                '@stylistic/no-invalid-void-type': 0,
                '@stylistic/no-loss-of-precision': 'error',
                '@stylistic/no-non-null-assertion': 0,
                '@stylistic/no-redeclare': 'error',
                '@stylistic/no-require-imports': 'error',
                '@stylistic/no-unused-vars': 0,
                '@stylistic/no-use-before-define': ['error', { classes: false, functions: false, variables: true }],
                '@stylistic/no-useless-constructor': 0,
                '@stylistic/prefer-ts-expect-error': 'error',
                '@stylistic/triple-slash-reference': 0,
                '@stylistic/unified-signatures': 0,

                ...overrides,
            },
        },
        ...isTypeAware
        ? [{
            files: filesTypeAware,
            name: 'moso/typescript/rules-type-aware',
            rules: {
                ...tsconfigPath ? typeAwareRules : {},
                ...overrides,
            },
        }]
        : [],
        {
            files: ['**/*.d.ts'],
            name: 'moso/typescript/disables/dts',
            rules: {
                'eslint-comments/no-unlimited-disable': 0,
                'import/no-duplicates': 0,
                'no-restricted-syntax': 0,
                'unused-imports/no-unused-vars': 0,
            },
        },
        {
            files: ['**/*.{test,spec}.ts?(x)'],
            name: 'moso/typescript/disables/test',
            rules: {
                'no-unused-expressions': 0,
            },
        },
        {
            files: ['**/*.js', '**/*.cjs'],
            name: 'moso/typescript/disables/cjs',
            rules: {
                '@stylistic/no-require-imports': 0,
                '@stylistic/no-var-requires': 0,
            },
        },
    ];
};
