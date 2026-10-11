import { loadPackages } from '../tools';
import { memoize } from '../utils';

import type {
    OptionsBaseline,
    OptionsFiles,
    OptionsHasDOM,
    OptionsTypeScriptContext,
    TypedFlatConfigItem,
} from '../types';

const defaultIgnoreFeatures = ['functions-caller-arguments'];

export const baseline = async (
    options: Readonly<
        OptionsBaseline &
        OptionsHasDOM &
        OptionsTypeScriptContext &
        Required<OptionsFiles>
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        baseline = 'widely',
        files,
        hasDOM,
        ignoreFeatures,
        ignoreNodeTypes,
        overrides,
        typescript,
    } = options;

    const isTypeAware = typescript.typeAware;

    const [baselinePlugin] = await loadPackages(['eslint-plugin-baseline-js']);

    const baselineRule = (typeAware: boolean): TypedFlatConfigItem['rules'] => ({
        'baseline-js/use-baseline': [
            'warn',
            {
                available: baseline,
                ignoreFeatures: [...defaultIgnoreFeatures, ...(ignoreFeatures ?? [])],
                ignoreNodeTypes,
                includeJsBuiltins: { preset: typeAware ? 'type-aware' : 'auto' },
                includeWebApis: hasDOM !== false && { preset: typeAware ? 'type-aware' : 'auto' },
            },
        ],
    });

    return [
        {
            name: 'moso/baseline/setup',
            plugins: {
                'baseline-js': memoize(baselinePlugin, 'eslint-plugin-baseline-js'),
            },
        },
        {
            name: 'moso/baseline/rules',
            files: isTypeAware ? files : [...files, ...typescript.filesTypeAware],
            rules: {
                ...baselineRule(false),
                ...overrides,
            },
        },
        ...(isTypeAware
            ? [{
                name: 'moso/baseline/type-aware-rules',
                files: typescript.filesTypeAware,
                ignores: typescript.ignoresTypeAware,
                rules: {
                    ...baselineRule(true),
                    ...typescript.overridesTypeAware,
                },
            } satisfies TypedFlatConfigItem]
            : []),
    ];
};
