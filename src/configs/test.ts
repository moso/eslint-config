import { GLOB_TESTS } from '../globs';
import { interopDefault } from '../utils';

import type { OptionsFiles, OptionsIsInEditor, OptionsOverrides, TypedFlatConfigItem } from '../types';

export const test = async (options:
    OptionsFiles &
    OptionsIsInEditor &
    OptionsOverrides = {},
): Promise<TypedFlatConfigItem[]> => {
    const {
        files = GLOB_TESTS,
        isInEditor = false,
        overrides = {},
    } = options;

    const [
        vitestPlugin,
        noOnlyTestsPlugin,
    ] = await Promise.all([
        interopDefault(import('@vitest/eslint-plugin')),
        interopDefault(import('eslint-plugin-no-only-tests')),
    ] as const);

    return [
        {
            name: 'moso/test/setup',
            plugins: {
                'vitest': vitestPlugin,
                'no-only-tests': noOnlyTestsPlugin,
            },
        },
        {
            files,
            name: 'moso/test/rules',
            rules: {
                'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
                'vitest/no-identical-title': 'error',
                'vitest/no-import-node-test': 'error',
                'vitest/prefer-hooks-in-order': 'error',
                'vitest/prefer-lowercase-title': 'error',

                'no-only-tests/no-only-tests': isInEditor ? 'warn' : 'error',

                // Disables for tests
                ...{
                    'no-unused-expressions': 'off',
                    'node/prefer-global/process': 'off',
                    'typescript/explicit-function-return-type': 'off',
                },

                ...overrides,
            },
        },
    ];
};
