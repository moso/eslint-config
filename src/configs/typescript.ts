import process from 'node:process';

import { GLOB_MARKDOWN, GLOB_TS, GLOB_TSX } from '../globs';
import { interopDefault } from '../utils';

import type {
    OptionsComponentExts,
    OptionsFiles,
    OptionsOverrides,
    OptionsTypeScriptParserOptions,
    OptionsTypeScriptWithTypes,
    TypedFlatConfigItem,
} from '../types';

export interface TypeScriptOptions extends OptionsOverrides {
    lessOpinionated?: boolean;
};

export const typescript = async (options:
    OptionsFiles &
    OptionsComponentExts &
    TypeScriptOptions &
    OptionsTypeScriptWithTypes &
    OptionsTypeScriptParserOptions = {},
): Promise<TypedFlatConfigItem[]> => {
    const {
        componentExts = [],
        lessOpinionated = false,
        overrides = {},
        overridesTypeAware = {},
        parserOptions = {},
    } = options;

    const files = options.files ?? [
        GLOB_TS,
        GLOB_TSX,
        ...componentExts.map((ext) => `**/*.${ext}`),
    ];

    const filesTypeAware = options.filesTypeAware ?? [GLOB_TS, GLOB_TSX];
    const ignoresTypeAware = options.ignoresTypeAware ?? [`${GLOB_MARKDOWN}/**`];
    const tsconfigPath = options?.tsconfigPath
        ? options.tsconfigPath
        : undefined;
    const isTypeAware = !!tsconfigPath;

    const typeAwareRules: TypedFlatConfigItem['rules'] = {
        // JS off
        'dot-notation': 'off',
        'no-implied-eval': 'off',
        'no-throw-literal': 'off',

        // TypeScript
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/dot-notation': ['error', { allowKeywords: true }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-for-in-array': 'error',
        '@typescript-eslint/no-implied-eval': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/no-unsafe-argument': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/only-throw-error': 'error',
        '@typescript-eslint/parameter-properties': 'off',
        '@typescript-eslint/restrict-plus-operands': 'error',
        '@typescript-eslint/restrict-template-expressions': 'error',
        '@typescript-eslint/unbound-method': 'error',

        ...(lessOpinionated
            ? {}
            : {
                // Opinionated TypeScript
                '@typescript-eslint/no-unsafe-return': 'error',
                '@typescript-eslint/switch-exhaustiveness-check': [
                    'error',
                    {
                        considerDefaultExhaustiveForUnions: true,
                    },
                ],

                // Opinionated Functional
                // @see https://github.com/eslint-functional/eslint-plugin-functional
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
            }
        ),
    };

    const [
        antfuPlugin,
        functionalPlugin,
        typeScriptParser,
        typeScriptPlugin,
    ] = await Promise.all([
        interopDefault(import('eslint-plugin-antfu')),
        interopDefault(import('eslint-plugin-functional')),
        interopDefault(import('@typescript-eslint/parser')),
        interopDefault(import('@typescript-eslint/eslint-plugin')),
    ] as const);

    const makeParser = (typeAware: boolean, files: string[], ignores?: string[]): TypedFlatConfigItem => {
        return {
            files,
            ...ignores ? { ignores } : {},
            languageOptions: {
                parser: typeScriptParser,
                parserOptions: {
                    extraFileExtensions: componentExts.map((ext) => `.${ext}`),
                    sourceType: 'module',
                    ...typeAware
                        ? {
                            projectService: {
                                allowDefaultProject: ['./*.js', './*.ts'],
                                defaultProject: tsconfigPath,
                            },
                            tsconfigRootDir: process.cwd(),
                        }
                        : {},
                    ...parserOptions,
                },
            },
            name: `moso/typescript/${typeAware ? 'type-aware-parser' : 'parser'}`,
        };
    };

    return [
        {
            name: 'moso/typescript/setup',
            plugins: {
                'antfu': antfuPlugin,
                'functional': functionalPlugin,
                '@typescript-eslint': typeScriptPlugin,
            },
        },
        ...isTypeAware
            ? [
                makeParser(false, files),
                makeParser(true, filesTypeAware, ignoresTypeAware),
            ]
            : [
                makeParser(false, files),
            ],
        {
            files,
            name: 'moso/typescript/rules',
            rules: {
                ...typeScriptPlugin.configs['eslint-recommended'].overrides![0].rules!,
                ...typeScriptPlugin.configs.strict.rules!,

                // JS off
                'no-dupe-class-members': 'off',
                'no-redeclare': 'off',
                'no-loss-of-precision': 'off',
                'no-unused-vars': 'off',
                'no-use-before-define': 'off',
                'no-useless-constructor': 'off',

                // Stylistic
                '@stylistic/type-annotation-spacing': 'error',

                // Typescript
                '@typescript-eslint/ban-ts-comment': [
                    'error',
                    {
                        'ts-ignore': 'allow-with-description',
                    },
                ],
                '@typescript-eslint/consistent-type-imports': [
                    'error',
                    {
                        disallowTypeAnnotations: false,
                        prefer: 'type-imports',
                    },
                ],
                '@typescript-eslint/method-signature-style': ['error', 'property'],
                '@typescript-eslint/no-dynamic-delete': 'off',
                '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-extraneous-class': 'off',
                '@typescript-eslint/no-import-type-side-effects': 'error',
                '@typescript-eslint/no-invalid-void-type': 'off',
                '@typescript-eslint/no-non-null-assertion': 'off',
                '@typescript-eslint/no-require-imports': 'error',
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
                        ignoreRestSiblings: true,
                    },
                ],
                '@typescript-eslint/no-use-before-define': [
                    'error',
                    {
                        classes: false,
                        functions: false,
                        variables: true,
                    },
                ],
                '@typescript-eslint/no-useless-constructor': 'off',
                '@typescript-eslint/triple-slash-reference': 'off',
                '@typescript-eslint/unified-signatures': 'off',

                ...overrides,
            },
        },
        ...isTypeAware
            ? [{
                files: filesTypeAware,
                ignores: ignoresTypeAware,
                name: 'moso/typescript/rules-type-aware',
                rules: {
                    ...typeAwareRules,
                    ...overridesTypeAware,
                },
            }]
            : [],
        {
            files: ['**/*.d.ts'],
            name: 'moso/typescript/disables/dts',
            rules: {
                '@eslint-community/eslint-comments/no-unlimited-disable': 'off',
                'import-x/no-duplicates': 'off',
                'no-restricted-syntax': 'off',
                'unused-imports/no-unused-vars': 'off',
            },
        },
        {
            files: ['**/*.{test,spec}.ts?(x)'],
            name: 'moso/typescript/disables/test',
            rules: {
                'no-unused-expressions': 'off',
            },
        },
        {
            files: ['**/*.js', '**/*.cjs'],
            name: 'moso/typescript/disables/cjs',
            rules: {
                '@typescript-eslint/no-require-imports': 'off',
            },
        },
    ];
};
