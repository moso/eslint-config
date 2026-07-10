import assert from 'node:assert/strict';

import { GLOB_ASTRO, GLOB_SRC, GLOB_VUE } from '../globs';
import { loadPackages, memoize } from '../utils';

import type {
    OptionsFunctional,
    OptionsMode,
    OptionsOverrides,
    OptionsTypeScriptParserOptions,
    OptionsTypeScriptWithTypes,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

export const functional = async (
    options: Readonly<
        OptionsOverrides &
        OptionsTypeScriptWithTypes &
        Required<
            OptionsFunctional &
            OptionsMode &
            OptionsTypeScriptParserOptions &
            RequiredOptionsStylistic
        >
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        functionalEnforcement,
        ignoreNamePattern,
        mode,
        overrides,
        projectRoot,
        stylistic,
    } = options;

    const [functionalPlugin] = (await loadPackages(['eslint-plugin-functional'])) as [
        (typeof import('eslint-plugin-functional'))['default'],
    ];

    const stylisticEnabled = stylistic !== false;

    const isTypeAware = typeof projectRoot === 'string';

    const commonRules = {
        'functional/functional-parameters': [
            'error',
            {
                allowRestParameter: true,
                enforceParameterCount: false,
            },
        ],
        'functional/immutable-data': [
            'error',
            {
                ignoreAccessorPattern: ['**.mut_*.**'],
                ignoreClasses: 'fieldsOnly',
                ignoreImmediateMutation: true,
                ignoreNonConstDeclarations: true,
            },
        ],
        'functional/no-let': [
            'error',
            {
                allowInForLoopInit: true,
                ignoreIdentifierPattern: ignoreNamePattern,
            },
        ],
    } as const satisfies TypedFlatConfigItem['rules'];

    const commonStylisticRules = {
        'functional/prefer-property-signatures': stylisticEnabled ? 'error' : 'off',
        'functional/prefer-tacit': stylisticEnabled ? 'warn' : 'off',
        'functional/readonly-type': stylisticEnabled ? 'error' : 'off',
    } as const satisfies TypedFlatConfigItem['rules'];

    const strictRules = {
        ...(assert.ok(!Array.isArray(functionalPlugin.configs.strict)),
        functionalPlugin.configs.strict.rules),

        'functional/no-conditional-statements': ['error', { ignoreCodePattern: ['import.meta.vitest'] }],

        ...commonStylisticRules,
    } as const satisfies TypedFlatConfigItem['rules'];

    const recommendedRules = {
        ...(assert.ok(!Array.isArray(functionalPlugin.configs.recommended)),
        functionalPlugin.configs.recommended.rules),

        ...commonRules,

        'functional/functional-parameters': [
            'error',
            {
                ...commonRules['functional/functional-parameters'][1],
                overrides: [
                    {
                        specifiers: [
                            { from: 'file' },
                        ],
                        options: {
                            enforceParameterCount: {
                                count: 'atLeastOne',
                                ignoreGettersAndSetters: true,
                                ignoreIIFE: true,
                                ignoreLambdaExpression: true,
                            },
                        },
                    },
                ],
            },
        ],
        'functional/no-conditional-statements': [
            'error',
            {
                allowReturningBranches: true,
                ignoreCodePattern: ['import.meta.vitest'],
            },
        ],
        'functional/no-expression-statements': [
            'error',
            {
                ignoreCodePattern: '^assert',
                ignoreSelfReturning: true,
                ignoreVoid: true,
            },
        ],
        'functional/no-loop-statements': 'error',
        'functional/no-return-void': 'off',
        'functional/no-throw-statements': ['error', { allowToRejectPromises: true }],

        '@typescript-eslint/prefer-readonly-parameter-types': 'off',
        'functional/prefer-immutable-types': 'off',
        'functional/type-declaration-immutability': 'off',

        ...commonStylisticRules,
    } as const satisfies TypedFlatConfigItem['rules'];

    const liteRules = {
        ...(assert.ok(!Array.isArray(functionalPlugin.configs.lite)),
        functionalPlugin.configs.lite.rules),

        ...commonRules,

        'functional/no-loop-statements': 'error',
        'functional/no-mixed-types': mode === 'library' ? 'off' : 'error',
        'functional/no-return-void': 'off',
        'functional/no-throw-statements': ['error', { allowToRejectPromises: true }],

        '@typescript-eslint/prefer-readonly-parameter-types': 'off',
        'functional/prefer-immutable-types': 'off',
        'functional/type-declaration-immutability': 'off',

        ...commonStylisticRules,
    } as const satisfies TypedFlatConfigItem['rules'];

    return [
        {
            name: 'moso/functional',
            files: [GLOB_SRC, GLOB_ASTRO, GLOB_VUE],
            plugins: {
                'functional': memoize(functionalPlugin, 'eslint-plugin-functional'),
            },
            settings: {
                immutability: {
                    overrides: [
                        { type: '^Readonly<.+>$', to: 'ReadonlyShallow' },
                        { type: '^ReadonlyDeep<.+>$', to: 'ReadonlyDeep' },
                        { type: '^Immutable<.+>$', to: 'Immutable' },
                    ],
                },
            },
            rules: {
                ...(assert.ok(!Array.isArray(functionalPlugin.configs.off)),
                functionalPlugin.configs.off.rules),

                // The factory never invokes this config with 'none'
                ...(functionalEnforcement === 'lite'
                    ? liteRules
                    : functionalEnforcement === 'strict'
                        ? strictRules
                        : recommendedRules),

                ...overrides,
            },
        },
        ...((isTypeAware
            ? []
            : [
                {
                    name: 'moso/functional/disable-type-aware',
                    files: [GLOB_SRC, GLOB_ASTRO, GLOB_VUE],
                    rules: {
                        ...(assert.ok(!Array.isArray(functionalPlugin.configs.disableTypeChecked)),
                        functionalPlugin.configs.disableTypeChecked.rules),

                        'functional/no-let': [
                            'error',
                            {
                                allowInForLoopInit: true,
                                ignoreIdentifierPattern: ignoreNamePattern,
                            },
                        ],
                    },
                },
            ]) satisfies TypedFlatConfigItem[]
        ),
    ];
};
