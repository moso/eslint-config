import { loadPackages, memoize } from '../utils';

import type { ESLint } from 'eslint';

import type {
    OptionsJSDoc,
    OptionsLessOpinionated,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

export const jsdoc = async (
    options: Readonly<
        OptionsJSDoc &
        OptionsLessOpinionated &
        Required<RequiredOptionsStylistic>
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        lessOpinionated,
        overrides,
        stylistic,
    } = options;

    const [jsdocPlugin] = (await loadPackages(['eslint-plugin-jsdoc'])) as [ESLint.Plugin];

    const stylisticEnabled = stylistic === false ? 'off' : 'error';

    return [
        {
            name: 'moso/jsdoc',
            plugins: {
                'jsdoc': memoize(jsdocPlugin, 'eslint-plugin-jsdoc'),
            },
            rules: {
                'jsdoc/check-access': 'warn',
                'jsdoc/check-alignment': stylisticEnabled,
                'jsdoc/check-param-names': 'error',
                'jsdoc/check-property-names': 'error',
                'jsdoc/check-tag-names': 'error',
                'jsdoc/check-types': 'error',
                'jsdoc/check-values': 'error',
                'jsdoc/empty-tags': 'warn',
                'jsdoc/implements-on-classes': 'warn',
                'jsdoc/multiline-blocks': stylisticEnabled,
                'jsdoc/no-defaults': 'warn',
                'jsdoc/no-multi-asterisks': 'error',
                'jsdoc/no-undefined-types': ['error', { disableReporting: true }],
                'jsdoc/reject-any-type': 'error',
                'jsdoc/reject-function-type': 'error',
                'jsdoc/require-jsdoc': [
                    'warn',
                    {
                        contexts: [
                            ':matches(:matches(ExportDefaultDeclaration, ExportNamedDeclaration) > TSDeclareFunction, ExportDefaultDeclaration > FunctionDeclaration,:matches(ExportNamedDeclaration > FunctionDeclaration):not(ExportNamedDeclaration:has(TSDeclareFunction) + ExportNamedDeclaration > FunctionDeclaration))',
                            ':matches(ExportDefaultDeclaration, ExportNamedDeclaration) > TSTypeAliasDeclaration',
                            ':matches(ExportDefaultDeclaration, ExportNamedDeclaration) > TSInterfaceDeclaration',
                            ':matches(ExportDefaultDeclaration, ExportNamedDeclaration) > TSEnumDeclaration',
                        ],
                        enableFixer: false,
                        require: { FunctionDeclaration: false },
                    },
                ],
                'jsdoc/require-next-type': 'error',
                'jsdoc/require-param': 'warn',
                'jsdoc/require-param-description': 'warn',
                'jsdoc/require-param-name': 'warn',
                'jsdoc/require-property': 'warn',
                'jsdoc/require-property-description': 'warn',
                'jsdoc/require-property-name': 'warn',
                'jsdoc/require-returns': 'error',
                'jsdoc/require-returns-check': 'error',
                'jsdoc/require-returns-description': 'error',
                'jsdoc/require-throws-type': 'warn',
                'jsdoc/require-yields': 'error',
                'jsdoc/require-yields-check': 'error',
                'jsdoc/require-yields-type': 'error',
                'jsdoc/tag-lines': [
                    'warn',
                    'never',
                    {
                        applyToEndTag: false,
                        startLines: 1,
                        tags: { example: { lines: 'always' } },
                    },
                ],
                'jsdoc/valid-types': 'error',

                ...(!lessOpinionated && {
                    'jsdoc/check-indentation': 'warn',
                    'jsdoc/check-line-alignment': 'error',
                    'jsdoc/no-bad-blocks': [
                        'warn',
                        {
                            ignore: [
                                'ts-check',
                                'ts-expect-error',
                                'ts-ignore',
                                'ts-nocheck',
                                'vue-ignore',
                            ],
                        },
                    ],
                    // 'jsdoc/no-types': typescriptEnabled ? 'off' : 'warn',
                    'jsdoc/no-types': 'warn',
                    'jsdoc/require-asterisk-prefix': 'warn',
                    'jsdoc/require-description': 'warn',
                    'jsdoc/require-hyphen-before-param-description': 'warn',
                    'jsdoc/require-throws': 'warn',
                    'jsdoc/require-throws-description': 'warn',
                    'jsdoc/require-yields-description': 'error',
                    'jsdoc/sort-tags': 'off',
                }),

                ...overrides,
            },
        },
    ];
};
