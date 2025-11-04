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

    const getRules = (name: keyof typeof nextjsPlugin.configs): Record<string, unknown> => {
        const { rules } = nextjsPlugin.configs[name];
        // eslint-disable-next-line functional/no-throw-statements
        if (!rules) throw new Error(`[@moso/eslint-config] Failed to find config ${name} in @next/eslint-plugin-next`);

        return normalizeRules(rules);
    };

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
                ...getRules('recommended'),
                ...getRules('core-web-vitals'),

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
