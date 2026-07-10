import assert from 'node:assert/strict';

import { loadPackages, memoize } from '../utils';

import type {
    OptionsFiles,
    OptionsNextJS,
    TypedFlatConfigItem,
} from '../types';

export const nextjs = async (
    options: Readonly<OptionsFiles & OptionsNextJS>,
): Promise<TypedFlatConfigItem[]> => {
    const {
        files,
        mode,
        overrides,
    } = options;

    const [nextjsPlugin] = (await loadPackages(['@next/eslint-plugin-next'])) as [typeof import('@next/eslint-plugin-next')];

    return [
        {
            name: 'moso/nextjs/setup',
            languageOptions: {
                parserOptions: {
                    ecmaFeatures: {
                        jsx: true,
                    },
                },
                sourceType: 'module',
            },
            settings: {
                react: {
                    version: 'detect',
                },
            },
            plugins: {
                '@next/next': memoize(nextjsPlugin, '@next/eslint-plugin-next'),
            },
        },
        {
            name: 'moso/nextjs/rules',
            files,
            rules: {
                ...(assert.ok(!Array.isArray(nextjsPlugin.configs.recommended)),
                nextjsPlugin.configs.recommended.rules),

                ...(assert.ok(!Array.isArray(nextjsPlugin.configs['core-web-vitals'])),
                nextjsPlugin.configs['core-web-vitals'].rules),

                ...overrides,
            },
        },
        ...((mode === 'library'
            ? [{
                name: 'moso/next/library-rules',
                rules: {
                    '@next/next/no-html-link-for-pages': 'off',
                },
            }]
            : []) satisfies TypedFlatConfigItem[]
        ),
    ];
};
