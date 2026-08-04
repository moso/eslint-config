import { loadPackages } from '../tools';
import { memoize } from '../utils';

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

    const [baselinePlugin] = await loadPackages(['eslint-plugin-baseline-js']);

    return [
        {
            name: 'moso/baseline/setup',
            plugins: {
                'baseline-js': memoize(baselinePlugin, 'eslint-plugin-baseline-js'),
            },
        },
        {
            name: `moso/baseline/${isTypeAware ? 'type-aware-rules' : 'rules'}`,
            files: isTypeAware ? filesTypeAware : files,
            ignores: isTypeAware ? ignoresTypeAware : {},
            rules: {
                'baseline-js/use-baseline': [
                    'warn',
                    {
                        available: baseline ?? 'widely',
                        ignoreFeatures: [...defaultIgnoreFeatures, ...(ignoreFeatures ?? [])],
                        ignoreNodeTypes,
                        includeJsBuiltins: { preset: isTypeAware ? 'type-aware' : 'auto' },
                        includeWebApis: { preset: isTypeAware ? 'type-aware' : 'auto' },
                    },
                ],

                ...(isTypeAware
                    ? { ...overridesTypeAware }
                    : { ...overrides }
                ),
            },
        },
    ];
};
