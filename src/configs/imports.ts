import { interopDefault } from '@/utils';

import type { OptionsOverrides, OptionsStylistic, TypedFlatConfigItem } from '@/types';

export const imports = async (options: OptionsOverrides & OptionsStylistic = {}): Promise<TypedFlatConfigItem[]> => {
    const {
        overrides = {},
        stylistic = true,
    } = options;

    const [
        antfuPlugin,
        importPlugin,
    ] = await Promise.all([
        interopDefault(import('eslint-plugin-antfu')),
        interopDefault(import('eslint-plugin-import-x')),
    ] as const);

    return [
        {
            name: 'moso/imports/rules',
            plugins: {
                antfu: antfuPlugin,
                import: importPlugin,
            },
            rules: {
                'import/first': 'error',
                'import/no-duplicates': 'error',
                'import/no-mutable-exports': 'error',
                'import/no-named-default': 'off',
                'import/no-self-import': 'error',
                'import/no-unresolved': 'off',
                'import/no-webpack-loader-syntax': 'error',
                'import/order': 'error',

                ...stylistic
                    ? {
                        'import/newline-after-import': ['error', { count: 1 }],
                    }
                    : {},

                ...overrides,
            },
        },
    ];
};
