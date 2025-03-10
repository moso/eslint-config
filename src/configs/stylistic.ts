import { interopDefault } from '../utils';

import type { OptionsOverrides, StylisticConfig, TypedFlatConfigItem } from '../types';

export const StylisticConfigDefaults: StylisticConfig = {
    indent: 4,
    jsx: true,
    quotes: 'single',
    semi: true,
};

export interface StylisticOptions extends StylisticConfig, OptionsOverrides {
    lessOpinionated?: boolean;
};

export const stylistic = async (options: StylisticOptions = {}): Promise<TypedFlatConfigItem[]> => {
    const {
        indent,
        jsx,
        lessOpinionated = false,
        overrides = {},
        quotes,
        semi,
    } = {
        ...StylisticConfigDefaults,
        ...options,
    };

    const [
        antfuPlugin,
        stylisticPlugin,
    ] = await Promise.all([
        interopDefault(import('eslint-plugin-antfu')),
        interopDefault(import('@stylistic/eslint-plugin')),
    ] as const);

    const config = stylisticPlugin.configs.customize({
        indent,
        jsx,
        quotes,
        semi,
    });

    return [
        {
            name: 'moso/stylistic/rules',
            plugins: {
                '@stylistic': stylisticPlugin,
                'antfu': antfuPlugin,
            },
            rules: {
                ...config.rules,

                'antfu/consistent-list-newline': 'error',
                '@stylistic/object-curly-newline': 'off',

                ...(lessOpinionated
                    ? {
                        curly: ['error', 'all'],
                    }
                    : {
                        '@stylistic/array-bracket-spacing': ['error', 'never'],
                        '@stylistic/arrow-parens': ['error', 'always'],
                        '@stylistic/block-spacing': ['error', 'always'],
                        '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
                        '@stylistic/comma-dangle': ['error', 'always-multiline'],
                        '@stylistic/comma-spacing': ['error', { before: false, after: true }],
                        '@stylistic/comma-style': ['error', 'last'],
                        '@stylistic/func-call-spacing': ['error', 'never'],
                        '@stylistic/generator-star-spacing': 'off',
                        '@stylistic/indent': [
                            'error',
                            4,
                            {
                                SwitchCase: 1,
                                VariableDeclarator: 1,
                                outerIIFEBody: 1,
                            },
                        ],
                        '@stylistic/key-spacing': [
                            'error',
                            {
                                beforeColon: false,
                                afterColon: true,
                            },
                        ],
                        '@stylistic/member-delimiter-style': [
                            'error',
                            {
                                multiline: {
                                    delimiter: 'semi',
                                    requireLast: true,
                                },
                            },
                        ],
                        '@stylistic/no-confusing-arrow': ['error', { onlyOneSimpleParam: true }],
                        '@stylistic/no-mixed-operators': [
                            'error',
                            {
                                groups: [
                                    ['&', '|', '^', '~', '<<', '>>', '>>>'],
                                    ['&&', '||'],
                                ],
                            },
                        ],
                        '@stylistic/no-mixed-spaces-and-tabs': 'error',
                        '@stylistic/no-multi-spaces': 'error',
                        '@stylistic/no-tabs': 'error',
                        '@stylistic/no-trailing-spaces': [
                            'error',
                            {
                                skipBlankLines: true,
                                ignoreComments: true,
                            },
                        ],
                        '@stylistic/operator-linebreak': ['error', 'before'],
                        '@stylistic/quote-props': ['error', 'consistent'],
                        '@stylistic/quotes': ['error', 'single', { allowTemplateLiterals: true }],
                        '@stylistic/rest-spread-spacing': ['error', 'never'],
                        '@stylistic/semi': ['error', 'always'],
                        '@stylistic/semi-spacing': 'error',
                        '@stylistic/semi-style': ['error', 'last'],
                        '@stylistic/space-before-blocks': 'error',
                        '@stylistic/space-before-function-paren': [
                            'error',
                            {
                                anonymous: 'never',
                                named: 'never',
                                asyncArrow: 'always',
                            },
                        ],
                        '@stylistic/space-infix-ops': 'error',
                        '@stylistic/space-unary-ops': 'error',
                        '@stylistic/spaced-comment': ['error', 'always'],
                        '@stylistic/switch-colon-spacing': 'error',
                        '@stylistic/template-curly-spacing': 'error',
                        '@stylistic/template-tag-spacing': ['error', 'always'],
                        '@stylistic/wrap-iife': ['error', 'any', { functionPrototypeMethods: true }],
                        '@stylistic/wrap-regex': 'error',
                        '@stylistic/yield-star-spacing': ['error', 'before'],
                    }
                ),

                ...overrides,
            },
        },
    ];
};
