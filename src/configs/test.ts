import mosoPlugin from '../rules';
import {
    interopDefault,
    loadPackages,
    memoize,
} from '../utils';

import type { ESLint } from 'eslint';

import type {
    OptionsFiles,
    OptionsOverrides,
    TypedFlatConfigItem,
} from '../types';

export const test = async (
    options: Readonly<OptionsOverrides & Required<OptionsFiles>>,
): Promise<TypedFlatConfigItem[]> => {
    const { files, overrides } = options;

    const [noOnlyTestsPlugin, vitestPlugin] = (await loadPackages([
        'eslint-plugin-no-only-tests',
        '@vitest/eslint-plugin',
    ])) as [ESLint.Plugin, ESLint.Plugin];

    const functionalPlugin = (await interopDefault(import('eslint-plugin-functional')));

    return [
        {
            name: 'moso/test/setup',
            plugins: {
                '@moso': memoize(mosoPlugin, '@moso/eslint-plugin'),
                'test': {
                    ...vitestPlugin,
                    rules: {
                        ...vitestPlugin.rules,
                        ...noOnlyTestsPlugin.rules,
                    },
                },
            },
            settings: {
                vitest: {
                    typecheck: true,
                },
            },
        },
        {
            name: 'moso/test/rules',
            files,
            rules: {
                ...functionalPlugin.configs.off.rules,

                '@moso/no-top-level-await': 'off',

                'jsdoc/require-jsdoc': 'off',

                'node/no-sync': 'off',
                'node/prefer-global/process': 'off',

                'regexp/no-super-linear-backtracking': 'off',

                'unicorn/consistent-function-scoping': 'off',
                'unicorn/prefer-module': 'off',

                '@typescript-eslint/consistent-type-definitions': 'off',
                '@typescript-eslint/no-unsafe-argument': 'off',
                '@typescript-eslint/no-unsafe-assignment': 'off',
                '@typescript-eslint/no-unsafe-call': 'off',
                '@typescript-eslint/no-unsafe-member-access': 'off',
                '@typescript-eslint/no-unsafe-return': 'off',
                '@typescript-eslint/no-unused-expressions': 'off',
                '@typescript-eslint/no-unused-vars': 'off',
                '@typescript-eslint/strict-boolean-expressions': 'off',

                'test/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
                'test/no-identical-title': 'error',
                'test/no-import-node-test': 'error',
                'test/prefer-hooks-in-order': 'error',
                'test/prefer-lowercase-title': 'error',
                'test/valid-expect': 'off',

                'test/no-only-tests': 'error',

                ...overrides,
            },
        },
    ];
};
