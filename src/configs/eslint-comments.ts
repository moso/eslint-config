import assert from 'node:assert/strict';

import { loadPackages, memoize } from '../utils';

import type { ESLint } from 'eslint';

import type { OptionsFiles, OptionsOverrides, TypedFlatConfigItem } from '../types';

export const comments = async (
    options: Readonly<
        OptionsOverrides &
        Required<OptionsFiles>
    >,
): Promise<TypedFlatConfigItem[]> => {
    const { files, overrides } = options;

    const [eslintComments] = (await loadPackages(['@eslint-community/eslint-plugin-eslint-comments'])) as [ESLint.Plugin];

    return [
        {
            name: 'moso/eslint-comments',
            files,
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
