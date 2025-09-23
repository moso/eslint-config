import { configs as regexpPluginConfigs } from 'eslint-plugin-regexp';

import { loadPackages, memoize } from '../utils';

import type { ESLint } from 'eslint';

import type { OptionsOverrides, TypedFlatConfigItem } from '../types';

export const regexp = async (
    options: Readonly<OptionsOverrides>,
): Promise<TypedFlatConfigItem[]> => {
    const { overrides } = options;

    const [regexpPlugin] = (await loadPackages(['eslint-plugin-regexp'])) as [ESLint.Plugin];

    return [
        {
            name: 'moso/regexp',
            plugins: {
                'regexp': memoize(regexpPlugin, 'eslint-plugin-regexp'),
            },
            rules: {
                'no-empty-character-class': 'off',
                'no-invalid-regexp': 'off',
                'no-useless-backreference': 'off',

                ...regexpPluginConfigs['flat/recommended'].rules,

                // Accept Annex B from unicorn/better-regex
                'regexp/strict': 'off',
                'unicorn/better-regex': 'warn',

                ...overrides,
            },
        },
    ];
};
