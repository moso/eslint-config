import assert from 'node:assert/strict';

import { interopDefault, loadPackages, memoize } from '../utils';

import type { ESLint } from 'eslint';

import type {
    OptionsFiles,
    OptionsIsInEditor,
    OptionsOverrides,
    TypedFlatConfigItem,
} from '../types';

export const test = async (
    options: Readonly<
        OptionsIsInEditor &
        OptionsOverrides &
        Required<OptionsFiles>
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        isInEditor,
        files,
        overrides,
    } = options;

    const [functionalPlugin, noOnlyTestsPlugin] = (
        await loadPackages(['eslint-plugin-functional', 'eslint-plugin-no-only-tests'])
    ) as [(typeof import('eslint-plugin-functional'))['default'], ESLint.Plugin];

    const vitestPlugin = await interopDefault(import('@vitest/eslint-plugin'));

    return [
        {
            name: 'moso/test/setup',
            plugins: {
                'no-only-tests': memoize(noOnlyTestsPlugin, 'eslint-plugin-no-only-tests'),
                'vitest': memoize(vitestPlugin, '@vitest/eslint-plugin'),
            },
            settings: {
                vitest: {
                    typecheck: true,
                },
            },
            languageOptions: {
                globals: {
                    ...vitestPlugin.environments.env.globals,
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

                'no-only-tests/no-only-tests': isInEditor ? 'warn' : 'error',

                ...(assert.ok(!Array.isArray(vitestPlugin.configs.recommended)),
                vitestPlugin.configs.recommended.rules),

                'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
                'vitest/prefer-hooks-in-order': 'error',
                'vitest/prefer-lowercase-title': 'error',
                'vitest/valid-expect': 'off',

                'vitest/valid-title': 'off',

                ...overrides,
            },
        },
    ];
};
