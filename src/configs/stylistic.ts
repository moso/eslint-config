import { interopDefault } from '@/utils';

import type { OptionsOverrides, StylisticConfig, TypedFlatConfigItem } from '@/types';

export const StylisticConfigDefaults: StylisticConfig = {
    indent: 4,
    jsx: true,
    quotes: 'single',
    semi: true,
};

export const stylistic = async (options: StylisticConfig & OptionsOverrides = {}): Promise<TypedFlatConfigItem[]> => {
    const {
        indent,
        jsx,
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
        flat: true,
        indent,
        jsx,
        quotes,
        semi,
    });

    return [
        {
            name: 'moso/stylistic/rules',
            plugins: {
                antfu: antfuPlugin,
                '@stylistic': stylisticPlugin,
            },
            rules: {
                ...config.rules,

                'antfu/consistent-list-newline': 'error',
                'antfu/if-newline': 'error',
                'antfu/indent-binary-ops': ['error', { indent }],
                'antfu/top-level-function': 'error',

                '@stylistic/array-bracket-spacing': ['error', 'never'],
                '@stylistic/arrow-parens': ['error', 'always'],
                '@stylistic/block-spacing': ['error', 'always'],
                '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
                '@stylistic/comma-dangle': ['error', 'always-multiline'],
                '@stylistic/comma-spacing': ['error', { before: false, after: true }],
                '@stylistic/comma-style': ['error', 'last'],
                '@stylistic/curly': ['error', 'multi-or-nest', 'consistent'],
                '@stylistic/func-call-spacing': ['error', 'never'],
                '@stylistic/generator-star-spacing': 0,
                '@stylistic/indent': ['error', 4, { SwitchCase: 1, VariableDeclarator: 1, outerIIFEBody: 1 }],
                '@stylistic/key-spacing': ['error', { beforeColon: false, afterColon: true }],
                '@stylistic/member-delimiter-style': ['error', { multiline: { delimiter: 'semi', requireLast: true } }],
                '@stylistic/no-mixed-spaces-and-tabs': 'error',
                '@stylistic/no-multi-spaces': 'error',
                '@stylistic/operator-linebreak': ['error', 'before'],
                '@stylistic/quotes': ['error', 'single', { allowTemplateLiterals: true }],
                '@stylistic/semi': ['error', 'always'],
                '@stylistic/space-before-function-paran': ['error', { anonymous: 'never', named: 'never', asyncArrow: 'always' }],
                '@stylistic/type-annotation-spacing': ['error', {}],
                '@stylistic/vars-on-top': 'error',
                '@stylistic/wrap-iife': ['error', 'any', { functionPrototypeMethods: true }],

                ...overrides,
            },
        },
    ];
};
