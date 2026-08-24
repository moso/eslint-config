import assert from 'node:assert/strict';

import { loadPackages } from '../tools';
import { memoize } from '../utils';

import type { OptionsFiles, OptionsNextJS, TypedFlatConfigItem } from '../types';

export const nextjs = async (options: Readonly<OptionsNextJS & Required<OptionsFiles>>): Promise<TypedFlatConfigItem[]> => {
    const { files, mode, overrides } = options;

    const [nextjsPlugin] = await loadPackages(['@next/eslint-plugin-next']);

    return [
        {
            name: 'moso/nextjs/setup',
            plugins: {
                '@next/next': memoize(nextjsPlugin, '@next/eslint-plugin-next'),
            },
        },
        {
            name: 'moso/nextjs/rules',
            files,
            languageOptions: {
                parserOptions: {
                    ecmaFeatures: { jsx: true },
                },
                sourceType: 'module',
            },
            settings: {
                react: { version: 'detect' },
            },
            rules: {
                ...(assert.ok(!Array.isArray(nextjsPlugin.configs.recommended)),
                nextjsPlugin.configs.recommended.rules),

                ...(assert.ok(!Array.isArray(nextjsPlugin.configs['core-web-vitals'])),
                nextjsPlugin.configs['core-web-vitals'].rules),

                ...(mode === 'library' && {
                    '@next/next/no-html-link-for-pages': 'off',
                }),

                ...overrides,
            },
        },
    ];
};
