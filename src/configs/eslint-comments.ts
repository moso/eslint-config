import assert from 'node:assert/strict';

import { loadPackages, memoize } from '../utils';

import type { ESLint } from 'eslint';

import type { OptionsOverrides, TypedFlatConfigItem } from '../types';

export const comments = async (
    options: Readonly<OptionsOverrides> = {},
): Promise<TypedFlatConfigItem[]> => {
    const { overrides } = options;

    const [eslintComments] = (await loadPackages(['@eslint-community/eslint-plugin-eslint-comments'])) as [ESLint.Plugin];

    return [
        {
            name: 'moso/eslint-comments',
            plugins: {
                '@eslint-community/eslint-comments': memoize(eslintComments, '@eslint-community/eslint-comments'),
            },
            rules: {
                ...(assert(!Array.isArray(eslintComments.configs?.['recommended'])),
                eslintComments.configs?.['recommended']?.rules),

                '@eslint-community/eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],

                ...overrides,
            },
        },
    ];
};
