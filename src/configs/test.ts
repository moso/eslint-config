import { GLOB_TESTS } from '@/globs';
import { interopDefault } from '@/utils';

import type { OptionsFiles, OptionsIsInEditor, OptionsOverrides, TypedFlatConfigItem } from '@/types';

export const test = async (options: OptionsFiles & OptionsIsInEditor & OptionsOverrides = {}): Promise<TypedFlatConfigItem[]> => {
    const {
        files = GLOB_TESTS,
        isInEditor = false,
        overrides = {},
    } = options;

    const [
        noOnlyTestsPlugin,
        vitestPlugin,
    ] = await Promise.all([
        interopDefault(import('eslint-plugin-vitest')),
        interopDefault(import('eslint-plugin-no-only-tests')),
    ] as const);

    return [
        {
            name: 'moso/test/setup',
            plugins: {
                vitest: {
                    ...vitestPlugin,
                    rules: {
                        ...vitestPlugin.rules,
                        ...noOnlyTestsPlugin.rules,
                    },
                },
            },
        },
        {
            files,
            name: 'moso/test/rules',
            rules: {
                'node/prefer-global/process': 'off',

                'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
                'vitest/no-identical-title': 'error',
                'vitest/no-import-node-test': 'error',
                'vitest/no-only-tests': isInEditor ? 'off' : 'error',
                'vitest/prefer-hooks-in-order': 'error',
                'vitest/prefer-lowercase-title': 'error',

                ...overrides,
            },
        },
    ];
};
