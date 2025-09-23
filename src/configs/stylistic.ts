import { loadPackages, memoize } from '../utils';

import type { StylisticCustomizeOptions } from '@stylistic/eslint-plugin';

import type {
    OptionsHasTypeScript,
    OptionsLessOpinionated,
    OptionsOverrides,
    StylisticConfig,
    TypedFlatConfigItem,
} from '../types';

export const StylisticConfigDefaults: Required<StylisticConfig> = {
    indent: 4,
    jsx: true,
    quotes: 'single',
    semi: true,
};

export const stylistic = async (
    options: Readonly<
        OptionsLessOpinionated &
        OptionsOverrides &
        Required<OptionsHasTypeScript & { stylistic: Required<StylisticConfig> }>
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        lessOpinionated,
        overrides,
        stylistic: {
            indent,
            jsx,
            quotes,
            semi,
        },
        typescript,
    } = options;

    const [stylisticPlugin] = (await loadPackages(['@stylistic/eslint-plugin'])) as [typeof import('@stylistic/eslint-plugin')['default']];

    const config = stylisticPlugin.configs.customize({
        indent,
        jsx,
        quotes,
        semi,
        severity: 'error',
    } as StylisticCustomizeOptions);

    return [
        {
            name: 'moso/stylistic',
            plugins: {
                '@stylistic': memoize(stylisticPlugin, '@stylistic/eslint-plugin'),
            },
            rules: {
                // This adds the `rules` from the `customize` config options.
                // @see https://github.com/eslint-stylistic/eslint-stylistic/blob/main/packages/eslint-plugin/configs/customize.ts
                ...config.rules,

                // These are the overrides to above `rules` if `options.lessOpinionated` is not false,
                // as well as rules not defined in above `rules` but considered more or less default,
                // or I simply wanted/needed the rule set - even with documented defaults
                ...(!lessOpinionated && {
                    '@stylistic/array-element-newline': [
                        'error',
                        {
                            consistent: true,
                            minItems: 4,
                            multiline: true,
                        },
                    ],
                    '@stylistic/arrow-parens': ['error', 'always'],
                    '@stylistic/block-spacing': ['error', 'always'],
                    '@stylistic/brace-style': [
                        'error',
                        '1tbs',
                        {
                            allowSingleLine: true,
                        },
                    ],
                    '@stylistic/comma-dangle': [
                        'error',
                        {
                            arrays: 'always-multiline',
                            dynamicImports: 'always-multiline',
                            exports: 'always-multiline',
                            functions: 'ignore',
                            imports: 'always-multiline',
                            importAttributes: 'always-multiline',
                            objects: 'always-multiline',

                            ...(typescript && {
                                enums: 'always-multiline',
                                generics: 'always-multiline',
                                tuples: 'always-multiline',
                            }),
                        },
                    ],
                    '@stylistic/computed-property-spacing': 'error',
                    '@stylistic/dot-location': ['error', 'property'],
                    '@stylistic/eol-last': ['error', 'always'],
                    '@stylistic/function-call-argument-newline': ['error', 'consistent'],
                    '@stylistic/function-paren-newline': ['error', 'consistent'],
                    '@stylistic/generator-star-spacing': ['error', 'after'],
                    '@stylistic/indent': typescript
                        ? 'off'
                        : [
                            'error',
                            indent,
                            {
                                ignoreComments: false,
                                flatTernaryExpressions: false,
                                outerIIFEBody: 1,
                                ArrayExpression: 1,
                                CallExpression: { arguments: 1 },
                                FunctionDeclaration: { parameters: 1, body: 1 },
                                FunctionExpression: { parameters: 1, body: 1 },
                                ImportDeclaration: 1,
                                MemberExpression: 'off',
                                ObjectExpression: 1,
                                SwitchCase: 1,
                                VariableDeclarator: 1,
                            },
                        ],
                    '@stylistic/indent-binary-ops': ['error', indent],
                    '@stylistic/lines-around-comment': [
                        'warn',
                        {
                            afterBlockComment: false,
                            afterHashbangComment: true,
                            afterLineComment: false,
                            allowClassEnd: true,
                            allowClassStart: true,
                            allowArrayEnd: true,
                            allowArrayStart: true,
                            allowBlockEnd: true,
                            allowBlockStart: true,
                            allowObjectEnd: true,
                            allowObjectStart: true,
                            beforeBlockComment: true,
                            beforeLineComment: false,

                            ...(typescript && {
                                allowEnumEnd: true,
                                allowEnumStart: true,
                                allowInterfaceEnd: true,
                                allowInterfaceStart: true,
                                allowModuleEnd: true,
                                allowModuleStart: true,
                                allowTypeEnd: true,
                                allowTypeStart: true,
                            }),

                            applyDefaultIgnorePatterns: true,
                        },
                    ],
                    '@stylistic/lines-between-class-members': [
                        'error',
                        'always',
                        {
                            ...(typescript && {
                                exceptAfterOverload: true,
                            }),

                            exceptAfterSingleLine: true,
                        },
                    ],
                    '@stylistic/no-confusing-arrow': ['error', { onlyOneSimpleParam: true }],
                    '@stylistic/no-extra-parens': 'off',
                    '@stylistic/no-mixed-operators': [
                        'error',
                        {
                            allowSamePrecedence: true,
                            groups: [
                                [
                                    '+',
                                    '-',
                                    '*',
                                    '/',
                                    '%',
                                    '**',
                                ],
                                [
                                    '&',
                                    '|',
                                    '^',
                                    '~',
                                    '<<',
                                    '>>',
                                    '>>>',
                                ],
                                [
                                    '==',
                                    '!=',
                                    '===',
                                    '!==',
                                    '>',
                                    '>=',
                                    '<',
                                    '<=',
                                ],
                                ['&&', '||'],
                                ['in', 'instanceof'],
                            ],
                        },
                    ],
                    '@stylistic/no-multi-spaces': ['error', { ignoreEOLComments: true }],
                    '@stylistic/no-tabs': 'error',
                    '@stylistic/no-trailing-spaces': ['error', { ignoreComments: true, skipBlankLines: true }],
                    '@stylistic/object-curly-newline': [
                        'error',
                        {
                            consistent: true,
                            minProperties: 4,
                            multiline: true,
                        },
                    ],
                    '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
                    '@stylistic/one-var-declaration-per-line': ['error', 'always'],
                    '@stylistic/operator-linebreak': [
                        'error',
                        'after',
                        {
                            overrides: {
                                // '=': 'none',
                                '==': 'none',
                                '===': 'none',
                                '?': 'before',
                                ':': 'before',
                                '|': 'before',
                            },
                        },
                    ],
                    '@stylistic/quote-props': ['error', 'consistent'],
                    '@stylistic/quotes': [
                        'error',
                        quotes,
                        {
                            allowTemplateLiterals: 'always',
                            avoidEscape: true,
                        },
                    ],
                    '@stylistic/space-before-function-paren': [
                        'error',
                        {
                            anonymous: 'never',
                            asyncArrow: 'always',
                            named: 'never',
                        },
                    ],
                    '@stylistic/spaced-comment': [
                        'error',
                        'always',
                        {
                            block: {
                                balanced: true,
                                exceptions: [
                                    '-',
                                    '+',
                                    '*',
                                ],
                                markers: [
                                    '*package',
                                    '!',
                                    '*',
                                    ',',
                                    ':',
                                    '::',
                                    'flow-include',
                                ],
                            },
                            line: {
                                exceptions: [
                                    '-',
                                    '+',
                                    '*',
                                ],
                                markers: [
                                    '*package',
                                    '!',
                                    '/',
                                    ',',
                                    '=',
                                ],
                            },
                        },
                    ],
                    '@stylistic/template-curly-spacing': ['error', 'never'],
                    '@stylistic/template-tag-spacing': ['error', 'always'],
                    '@stylistic/wrap-regex': 'error',
                    '@stylistic/yield-star-spacing': ['error', 'before'],

                    ...(typescript && {
                        '@stylistic/member-delimiter-style': [
                            'error',
                            {
                                multiline: {
                                    delimiter: 'semi',
                                    requireLast: true,
                                },
                            },
                        ],
                        '@stylistic/type-annotation-spacing': 'error',
                    }),
                }),

                ...overrides,
            },
        },
    ];
};
