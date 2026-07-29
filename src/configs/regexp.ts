import assert from 'node:assert/strict';

import { loadPackages, memoize } from '../utils';

import type { OptionsFiles, OptionsOverrides, TypedFlatConfigItem } from '../types';

export const regexp = async (
    options: Readonly<
        OptionsOverrides &
        Required<OptionsFiles>
    >,
): Promise<TypedFlatConfigItem[]> => {
    const { files, overrides } = options;

    const [regexpPlugin] = (await loadPackages(['eslint-plugin-regexp'])) as [typeof import('eslint-plugin-regexp')];

    return [
        {
            name: 'moso/regexp',
            files,
            plugins: {
                'regexp': memoize(regexpPlugin, 'eslint-plugin-regexp'),
            },
            rules: {
                'no-empty-character-class': 'off',
                'no-invalid-regexp': 'off',
                'no-useless-backreference': 'off',

                ...(assert.ok(!Array.isArray(regexpPlugin.configs['flat/recommended'])),
                regexpPlugin.configs['flat/recommended'].rules),

                // Accept Annex B
                'regexp/strict': 'off',

                ...overrides,
            },
        },
    ];
};
