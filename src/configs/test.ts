import assert from 'node:assert/strict';

import { loadPackages } from '../tools';
import { memoize } from '../utils';

import type {
    OptionsFiles,
    OptionsFunctional,
    OptionsIsInEditor,
    OptionsOverrides,
    TypedFlatConfigItem,
} from '../types';

export const test = async (
    options: Readonly<
        OptionsIsInEditor &
        OptionsOverrides &
        Required<OptionsFiles & OptionsFunctional>
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        functionalEnforcement,
        isInEditor,
        files,
        overrides,
    } = options;

    const [noOnlyTestsPlugin, vitestPlugin] = await loadPackages(['eslint-plugin-no-only-tests', '@vitest/eslint-plugin']);

    const [functionalPlugin] = functionalEnforcement === 'none'
        ? [undefined]
        : await loadPackages(['eslint-plugin-functional']);

    return [
        {
            name: 'moso/test/setup',
            languageOptions: {
                globals: {
                    ...vitestPlugin.environments.env.globals,
                },
            },
            settings: {
                vitest: { typecheck: true },
            },
            plugins: {
                'no-only-tests': memoize(noOnlyTestsPlugin, 'eslint-plugin-no-only-tests'),
                'vitest': memoize(vitestPlugin, '@vitest/eslint-plugin'),
            },
        },
        {
            name: 'moso/test/rules',
            files,
            rules: {
                ...(assert.ok(!Array.isArray(functionalPlugin?.configs.off)),
                functionalPlugin?.configs.off.rules),

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
