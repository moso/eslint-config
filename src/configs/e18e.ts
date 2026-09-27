import assert from 'node:assert/strict';

import { loadPackages } from '../tools';
import { memoize } from '../utils';

import type {
    OptionsE18e,
    OptionsIsInEditor,
    OptionsLessOpinionated,
    OptionsMode,
    TypedFlatConfigItem,
} from '../types';

export const e18e = async (
    options: Readonly<
        OptionsE18e &
        OptionsIsInEditor &
        OptionsLessOpinionated &
        OptionsMode
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        isInEditor,
        lessOpinionated,
        mode,
        modernization,
        moduleReplacements,
        overrides,
        performanceImprovements,
    } = options;

    const [e18ePlugin] = await loadPackages(['@e18e/eslint-plugin']);

    const enableModernization = modernization !== false;
    const enableModuleReplacements = moduleReplacements ?? (mode === 'library' && isInEditor === true);
    const enablePerformanceImprovements = performanceImprovements !== false;

    return [
        {
            name: 'moso/e18e/rules',
            plugins: {
                'e18e': memoize(e18ePlugin, '@e18e/eslint-plugin'),
            },
            rules: {
                ...(enableModernization && {
                    ...(assert.ok(!Array.isArray(e18ePlugin.configs.modernization)),
                    e18ePlugin.configs.modernization.rules),
                }),

                ...(enableModuleReplacements && {
                    ...(assert.ok(!Array.isArray(e18ePlugin.configs.moduleReplacements)),
                    e18ePlugin.configs.moduleReplacements.rules),
                }),

                ...(enablePerformanceImprovements && {
                    ...(assert.ok(!Array.isArray(e18ePlugin.configs.performanceImprovements)),
                    e18ePlugin.configs.performanceImprovements.rules),
                }),

                ...(mode === 'library' && {
                    'e18e/prefer-static-regex': 'off',
                }),

                ...(lessOpinionated && {
                    'e18e/prefer-array-at': 'off',
                    'e18e/prefer-array-from-map': 'off',
                    'e18e/prefer-array-to-reversed': 'off',
                    'e18e/prefer-array-to-sorted': 'off',
                    'e18e/prefer-array-to-spliced': 'off',
                    'e18e/prefer-spread-syntax': 'off',
                }),

                ...overrides,
            },
        },
    ];
};
