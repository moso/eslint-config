import { interopDefault } from '../utils';

import type { OptionsStylistic, TypedFlatConfigItem } from '../types';

export const imports = async (options: OptionsStylistic = {}): Promise<TypedFlatConfigItem[]> => {
    const {
        stylistic = true,
    } = options;

    const [
        antfuPlugin,
        importXPlugin,
    ] = await Promise.all([
        interopDefault(import('eslint-plugin-antfu')),
        interopDefault(import('eslint-plugin-import-x')),
    ] as const);

    return [
        {
            name: 'moso/imports/rules',
            plugins: {
                'antfu': antfuPlugin,
                'import-x': importXPlugin,
            },
            rules: {
                'antfu/import-dedupe': 'error',
                'antfu/no-import-dist': 'error',
                'antfu/no-import-node-modules-by-path': 'error',

                'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
                'import-x/first': 'error',
                'import-x/no-duplicates': ['error', { 'prefer-inline': true }],
                'import-x/no-mutable-exports': 'error',
                'import-x/no-named-default': 'off',
                'import-x/no-self-import': 'error',
                'import-x/no-unresolved': 'off',
                'import-x/no-webpack-loader-syntax': 'error',

                ...stylistic
                    ? {
                        'import-x/newline-after-import': ['error', { count: 1 }],
                    }
                    : {},
            },
        },
    ];
};
