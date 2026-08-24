import assert from 'node:assert/strict';

import { loadPackages } from '../tools';
import { memoize } from '../utils';

import type { OptionsOverrides, TypedFlatConfigItem } from '../types';

export const comments = async (options: Readonly<OptionsOverrides>): Promise<TypedFlatConfigItem[]> => {
    const { overrides } = options;

    const [eslintComments] = await loadPackages(['@eslint-community/eslint-plugin-eslint-comments']);

    return [
        {
            name: 'moso/eslint-comments',
            plugins: {
                '@eslint-community/eslint-comments': memoize(eslintComments, '@eslint-community/eslint-comments'),
            },
            rules: {
                ...(assert.ok(!Array.isArray(eslintComments.configs?.recommended)),
                eslintComments.configs?.recommended.rules),

                '@eslint-community/eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],

                ...overrides,
            },
        },
    ];
};
