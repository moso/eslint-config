import {
    ensurePackages,
    interopDefault,
    memoize,
    normalizeRules,
} from '../utils';

import type {
    OptionsFiles,
    OptionsOverrides,
    TypedFlatConfigItem,
} from '../types';

export const nextjs = async (
    options: Readonly<OptionsFiles & OptionsOverrides>,
): Promise<TypedFlatConfigItem[]> => {
    const { files, overrides } = options;

    await ensurePackages(['@next/eslint-plugin-next']);

    const nextjsPlugin = (await interopDefault(import('@next/eslint-plugin-next')));

    return [
        {
            name: 'moso/nextjs/setup',
            plugins: {
                '@next/next': memoize(normalizeRules(nextjsPlugin), '@next/eslint-plugin-next'),
            },
        },
        {
            name: 'moso/nextjs/rules',
            files,
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
            rules: {
                ...normalizeRules(nextjsPlugin.configs.recommended.rules),
                ...normalizeRules(nextjsPlugin.configs['core-web-vitals'].rules),

                'react-refresh/only-export-components': [
                    'warn',
                    {
                        allowExportNames: [
                            'config',
                            'generateMetadata',
                            'generateStaticParams',
                            'generateViewport',
                            'metadata',
                            'viewport',
                        ],
                    },
                ],

                ...overrides,
            },
        },
    ];
};
