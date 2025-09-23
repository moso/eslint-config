import { loadPackages, memoize } from '../utils';

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

    const [functionalPlugin] = (await loadPackages(['eslint-plugin-functional'])) as [
        (typeof import('eslint-plugin-functional'))['default'],
    ];

    const stylisticEnabled = typeof stylistic === 'object';

    const strictRules = {
        'functional/functional-parameters': 'error',
        'functional/immutable-data': 'error',
        'functional/no-class-inheritance': 'error',
        'functional/no-conditional-statements': ['error', { ignoreCodePattern: ['import.meta.vitest'] }],
        'functional/no-expression-statements': 'error',
        'functional/no-let': 'error',
        'functional/no-loop-statements': 'error',
        'functional/no-mixed-types': 'error',
        'functional/no-return-void': 'error',
        'functional/no-this-expressions': 'error',
        'functional/no-throw-statements': 'error',
        'functional/no-try-statements': 'error',
        'functional/prefer-immutable-types': 'error',
        'functional/prefer-property-signatures': stylisticEnabled ? 'error' : 'off',
        'functional/prefer-tacit': stylisticEnabled ? 'warn' : 'off',
        'functional/readonly-type': stylisticEnabled ? 'error' : 'off',
        'functional/type-declaration-immutability': 'error',
    } as const satisfies TypedFlatConfigItem['rules'];

    const recommendedRules = {
        '@typescript-eslint/prefer-readonly-parameter-types': 'off',

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
        'functional/no-let': [
            'error',
            {
                allowInForLoopInit: true,
                ignoreIdentifierPattern: ignoreNamePattern,
            },
        ],
        'functional/no-loop-statements': 'error',
        'functional/no-return-void': mode === 'library' ? 'error' : 'off',
        'functional/no-throw-statements': ['error', { allowToRejectPromises: true }],
        'functional/prefer-immutable-types': [
            mode === 'library' ? 'warn' : stylisticEnabled ? 'error' : 'off',
            {
                enforcement: 'None',
                overrides: [{
                    options: {
                        ignoreInferredTypes: true,
                        ignoreNamePattern,
                        parameters: { enforcement: 'ReadonlyShallow' },
                    },
                    specifiers: [
                        {
                            from: 'file',
                        },
                        {
                            from: 'lib',
                        },
                    ],
                }],
                suggestions: {
                    Immutable: [
                        [{
                            message: 'Surround with Immutable.',
                            pattern: '^(?:Readonly(?:Deep)?<(.+)>|(.+))$',
                            replace: 'Immutable<$1$2>',
                        }],
                    ],
                    ReadonlyDeep: [
                        [{
                            message: 'Surround with ReadonlyDeep.',
                            pattern: '^(?:Readonly<(.+)>|(.+))$',
                            replace: 'ReadonlyDeep<$1$2>',
                        }],
                    ],
                    ReadonlyShallow: [
                        [
                            {
                                message: 'Prepend with readonly.',
                                pattern: '^([_$a-zA-Z\\xA0-\\uFFFF][_$a-zA-Z0-9\\xA0-\\uFFFF]*\\[\\])$',
                                replace: 'readonly $1',
                            },
                            {
                                message: 'Use Readonly$1 instead of $1.',
                                pattern: '^(Array|Map|Set)<(.+)>$',
                                replace: 'Readonly$1<$2>',
                            },
                        ],
                        [
                            {
                                message: 'Surround with Readonly.',
                                pattern: '^(.+)$',
                                replace: 'Readonly<$1>',
                            },
                        ],
                    ],
                },
            },
        ],
        'functional/prefer-property-signatures': stylisticEnabled ? 'error' : 'off',
        'functional/prefer-tacit': stylisticEnabled ? 'warn' : 'off',
        'functional/readonly-type': stylisticEnabled ? 'error' : 'off',
        'functional/type-declaration-immutability': [
            'error',
            {
                rules: [
                    {
                        comparator: 'AtLeast',
                        identifiers: 'I?Immutable.+',
                        immutability: 'Immutable',
                    },
                    {
                        comparator: 'AtLeast',
                        identifiers: 'I?ReadonlyDeep.+',
                        immutability: 'ReadonlyDeep',
                    },
                    {
                        comparator: 'AtLeast',
                        fixer: [
                            {
                                pattern: '^([_$a-zA-Z\\xA0-\\uFFFF][_$a-zA-Z0-9\\xA0-\\uFFFF]*\\[\\])$',
                                replace: 'readonly $1',
                            },
                            {
                                pattern: '^(Array|Map|Set)<(.+)>$',
                                replace: 'Readonly$1<$2>',
                            },
                            {
                                pattern: '^(.+)$',
                                replace: 'Readonly<$1>',
                            },
                        ],
                        identifiers: 'I?Readonly.+',
                        immutability: 'ReadonlyShallow',
                    },
                    {
                        comparator: 'AtMost',
                        fixer: [
                            {
                                pattern: '^Readonly(Array|Map|Set)<(.+)>$',
                                replace: '$1<$2>',
                            },
                            {
                                pattern: '^Readonly<(.+)>$',
                                replace: '$1',
                            },
                        ],
                        identifiers: 'I?Mutable.+',
                        immutability: 'Mutable',
                    },
                ],
            },
        ],
    } as const satisfies TypedFlatConfigItem['rules'];

    const liteRules = {
        ...recommendedRules,
        'functional/no-conditional-statements': 'off',
        'functional/no-expression-statements': 'off',
        'functional/no-return-void': 'off',
        'functional/prefer-immutable-types': [
            mode === 'library' ? 'warn' : 'off',
            {
                ...recommendedRules['functional/prefer-immutable-types'][1],
                overrides: [{
                    ...recommendedRules['functional/prefer-immutable-types'][1].overrides[0],
                    specifiers: [{ from: 'file' }],
                }],
            },
        ],
    } as const satisfies TypedFlatConfigItem['rules'];

    const noneLibraryRules = {
        'functional/prefer-immutable-types': liteRules['functional/prefer-immutable-types'],
        'functional/type-declaration-immutability': ['warn', recommendedRules['functional/type-declaration-immutability'][1]],
    } as const satisfies TypedFlatConfigItem['rules'];

    return [
        {
            name: 'moso/functional',
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
                ...functionalPlugin.configs.off.rules,
                ...(functionalEnforcement === 'none'
                    ? mode === 'library'
                        ? noneLibraryRules
                        : {}
                    : functionalEnforcement === 'lite'
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
            rules: functionalPlugin.configs.disableTypeChecked.rules,
        },
    ];
};
