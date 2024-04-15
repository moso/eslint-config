import { isPackageExists } from 'local-pkg';

import { GLOB_JSX, GLOB_TSX } from '@/globs';
import { interopDefault } from '@/utils';

import type { OptionsFiles, OptionsHasTypeScript, OptionsOverrides, TypedFlatConfigItem } from '@/types';

const ReactRefreshAllowConstantExportPackages = [
    'vite',
];

export const react = async(options: OptionsHasTypeScript & OptionsOverrides & OptionsFiles = {}): Promise<TypedFlatConfigItem[]> => {
    const {
        files = [GLOB_JSX, GLOB_TSX],
        overrides = {},
        typescript = true,
    } = options;

    const [
        reactPlugin,
        reactHooksPlugin,
        reactRefreshPlugin,
    ] = await Promise.all([
        interopDefault(import('eslint-plugin-react')),
        interopDefault(import('eslint-plugin-react-hooks')),
        interopDefault(import('eslint-plugin-react-refresh')),
    ] as const);

    const isAllowConstantExport = ReactRefreshAllowConstantExportPackages.some(i => isPackageExists(i));

    return [
        {
            name: 'moso/react/setup',
            plugins: {
                'react': reactPlugin,
                'react-hooks': reactHooksPlugin,
                'react-refresh': reactRefreshPlugin,
            },
            settings: {
                react: {
                    version: 'detect',
                },
            },
        },
        {
            files,
            languageOptions: {
                parserOptions: {
                    ecmaFeatures: {
                        jsx: true,
                    },
                },
            },
            name: 'moso/react/rules',
            rules: {
                'react-hooks/exhaustive-deps': 'warn',
                'react-hooks/rules-of-hooks': 'error',

                'react-refresh/only-export-components': [
                    'warn',
                    { allowConstantExport: isAllowConstantExport },
                ],

                'react/display-name': 'error',
                'react/jsx-key': 'error',
                'react/jsx-no-comment-textnodes': 'error',
                'react/jsx-no-duplicate-props': 'error',
                'react/jsx-no-target-blank': 'error',
                'react/jsx-no-undef': 'error',
                'react/jsx-uses-react': 'error',
                'react/jsx-uses-vars': 'error',
                'react/no-children-prop': 'error',
                'react/no-danger-with-children': 'error',
                'react/no-deprecated': 'error',
                'react/no-direct-mutation-state': 'error',
                'react/no-find-dom-node': 'error',
                'react/no-is-mounted': 'error',
                'react/no-render-return-value': 'error',
                'react/no-string-refs': 'error',
                'react/no-unescaped-entities': 'error',
                'react/no-unknown-property': 'error',
                'react/no-unsafe': 0,
                'react/prop-types': 'error',
                'react/react-in-jsx-scope': 0,
                'react/require-render-return': 'error',

                ...typescript
                ? {
                    'react/jsx-no-undef': 0,
                    'react/prop-type': 0,
                    }
                : {},

                ...overrides,
            },
        },
    ];
};
