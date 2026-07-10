import assert from 'node:assert/strict';

import { GLOB_ASTRO, GLOB_SRC, GLOB_VUE } from '../globs';
import { loadPackages, memoize } from '../utils';

import type { OptionsOverrides, TypedFlatConfigItem } from '../types';

export const regexp = async (
    options: Readonly<OptionsOverrides>,
): Promise<TypedFlatConfigItem[]> => {
    const { overrides } = options;

    const [regexpPlugin] = (await loadPackages(['eslint-plugin-regexp'])) as [typeof import('eslint-plugin-regexp')];

    return [
        {
            name: 'moso/regexp',
            files: [GLOB_SRC, GLOB_ASTRO, GLOB_VUE],
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
