import assert from 'node:assert/strict';

import { loadPackages } from '../tools';
import { memoize } from '../utils';

import type {
    OptionsFunctional,
    OptionsMode,
    OptionsOverrides,
    OptionsTypeScriptParserOptions,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

export const functional = async (
    options: Readonly<
        OptionsOverrides &
        Required<
            OptionsFunctional &
            OptionsMode &
            OptionsTypeScriptParserOptions &
            RequiredOptionsStylistic
        >
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        filesTypeAware,
        functionalEnforcement,
        ignoreNamePattern,
        mode,
        overrides,
        stylistic,
    } = options;

    const [functionalPlugin] = await loadPackages(['eslint-plugin-functional']);

    const stylisticEnabled = stylistic !== false;

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
            settings: {
                immutability: {
                    overrides: [
                        { type: '^Readonly<.+>$', to: 'ReadonlyShallow' },
                        { type: '^ReadonlyDeep<.+>$', to: 'ReadonlyDeep' },
                        { type: '^Immutable<.+>$', to: 'Immutable' },
                    ],
                },
            },
            plugins: {
                'functional': memoize(functionalPlugin, 'eslint-plugin-functional'),
            },
            rules: {
                ...(assert.ok(!Array.isArray(functionalPlugin.configs.off)),
                functionalPlugin.configs.off.rules),

                ...(functionalEnforcement === 'lite'
                    ? liteRules
                    : functionalEnforcement === 'strict'
                        ? strictRules
                        : recommendedRules),

                ...overrides,
            },
        },
        {
            name: 'moso/functional/disable-type-aware',
            ignores: filesTypeAware,
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
    ];
};
