import { GLOB_TESTS } from '../globs';
import { loadPackages, memoize } from '../utils';

import type { ESLint } from 'eslint';

import type {
    OptionsBaseline,
    OptionsFiles,
    OptionsHasTypeScript,
    OptionsTypeScriptParserOptions,
    OptionsTypeScriptWithTypes,
    TypedFlatConfigItem,
} from '../types';

const defaultIgnoreFeatures = ['functions-caller-arguments'];

export const baseline = async (
    options: Readonly<
        OptionsBaseline &
        OptionsTypeScriptParserOptions &
        OptionsTypeScriptWithTypes &
        Required<OptionsFiles & OptionsHasTypeScript>
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        baseline,
        files,
        filesTypeAware,
        ignoreFeatures,
        ignoreNodeTypes,
        ignoresTypeAware,
        overrides,
        overridesTypeAware,
        projectRoot,
        typescript,
    } = options;

    const isTypeAware = typescript && typeof projectRoot === 'string';

    const [baselinePlugin] = (await loadPackages(['eslint-plugin-baseline-js'])) as [ESLint.Plugin];

    return [
        {
            name: 'moso/baseline/setup',
            plugins: {
                'baseline-js': memoize(baselinePlugin, 'eslint-plugin-baseline-js'),
            },
        },
        {
            name: 'moso/baseline/rules',
            files,
            rules: {
                'baseline-js/use-baseline': [
                    'warn',
                    {
                        available: baseline ?? 'widely',
                        ignoreFeatures: [...defaultIgnoreFeatures, ...(ignoreFeatures ?? [])],
                        ignoreNodeTypes,
                        includeJsBuiltins: { preset: 'auto' },
                        includeWebApis: { preset: 'auto' },
                    },
                ],

                ...overrides,
            },
        },
        ...((isTypeAware
            ? [{
                name: 'moso/baseline/type-aware-rules',
                files: filesTypeAware,
                ignores: ignoresTypeAware,
                rules: {
                    'baseline-js/use-baseline': [
                        'warn',
                        {
                            available: baseline ?? 'widely',
                            ignoreFeatures: [...defaultIgnoreFeatures, ...(ignoreFeatures ?? [])],
                            ignoreNodeTypes,
                            includeJsBuiltins: { preset: 'type-aware' },
                            includeWebApis: { preset: 'type-aware' },
                        },
                    ],

                    ...overridesTypeAware,
                },
            }]
            : []) satisfies TypedFlatConfigItem[]
        ),
        {
            name: 'moso/baseline/disables/test',
            files: GLOB_TESTS,
            rules: {
                'baseline-js/use-baseline': 'off',
            },
        },
    ];
};
