import assert from 'node:assert/strict';

import { isPackageExists } from 'local-pkg';

import {
    loadPackages,
    memoize,
} from '../utils';

import type { ESLint, Linter } from 'eslint';

import type {
    OptionsFiles,
    OptionsHasTypeScript,
    OptionsLessOpinionated,
    OptionsReact,
    OptionsTypeScriptParserOptions,
    OptionsTypeScriptWithTypes,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

const ReactRefreshAllowConstantExportPackages = ['vite'];
const ReactRouterPackages = [
    '@react-router/dev',
    '@react-router/node',
    '@react-router/react',
    '@react-router/serve',
];
const RemixPackages = [
    '@remix-run/dev',
    '@remix-run/node',
    '@remix-run/react',
    '@remix-run/serve',
];

export const react = async (
    options: Readonly<
        OptionsLessOpinionated &
        OptionsReact &
        OptionsTypeScriptParserOptions &
        OptionsTypeScriptWithTypes &
        Required<
            OptionsFiles &
            OptionsHasTypeScript &
            RequiredOptionsStylistic
        >
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        additionalHooks = 'useIsomorphicLayoutEffect',
        files,
        filesTypeAware,
        ignoresTypeAware,
        lessOpinionated,
        nextjs,
        overrides,
        overridesTypeAware,
        parserOptions,
        projectRoot,
        stylistic,
        typescript,
    } = options;

    const [
        reactPlugin,
        reactHooksPlugin,
        reactRefreshPlugin,
        reactYouMightNotNeedAnEffect,
    ] = (await loadPackages([
        '@eslint-react/eslint-plugin',
        'eslint-plugin-react-hooks',
        'eslint-plugin-react-refresh',
        'eslint-plugin-react-you-might-not-need-an-effect',
    ])) as [
        (typeof import('@eslint-react/eslint-plugin'))['default'],
        ESLint.Plugin,
        ESLint.Plugin,
        (typeof import('eslint-plugin-react-you-might-not-need-an-effect'))['default'],
    ];

    const isTypeAware = typeof projectRoot === 'string';

    const isAllowConstantExport = ReactRefreshAllowConstantExportPackages.some((x) => isPackageExists(x));
    const isUsingNextJS = nextjs !== false;
    const isUsingRemix = RemixPackages.some((x) => isPackageExists(x));
    const isUsingReactRouter = ReactRouterPackages.some((x) => isPackageExists(x));

    const reactHooks = additionalHooks ? additionalHooks.replaceAll(',', '|') : undefined;

    const stylisticEnabled = stylistic !== false;

    const [typescriptParser] = typescript ? (await loadPackages(['@typescript-eslint/parser'])) as [Linter.Parser] : [undefined];

    return [
        {
            name: 'moso/react',
            files,
            plugins: {
                '@eslint-react': memoize(reactPlugin, '@eslint-react'),
                'react-hooks': memoize(reactHooksPlugin, 'eslint-plugin-react-hooks'),
                'react-refresh': memoize(reactRefreshPlugin, 'eslint-plugin-react-refresh'),
                'react-you-might-not-need-an-effect': memoize(reactYouMightNotNeedAnEffect, 'eslint-plugin-react-you-might-not-need-an-effect'),
            },
            languageOptions: {
                parser: typescript ? typescriptParser : undefined,
                parserOptions: {
                    ecmaFeatures: {
                        jsx: true,
                    },
                    ...(typescript && parserOptions),
                },
                sourceType: 'module',
            },
            settings: {
                '@eslint-react': {
                    version: 'detect',
                },
            },
            rules: {
                ...(lessOpinionated
                    ? {
                        // Recommended rules from @eslint-react
                        ...(assert.ok(!Array.isArray(reactPlugin.configs.recommended)),
                        reactPlugin.configs.recommended.rules),

                        // Recommended rules from eslint-plugin-react-you-might-not-need-an-effect
                        ...(assert.ok(!Array.isArray(reactYouMightNotNeedAnEffect.configs.recommended)),
                        reactYouMightNotNeedAnEffect.configs.recommended.rules),
                    }
                    : {
                        // Recommended strict rules from @eslint-react
                        ...(assert.ok(!Array.isArray(reactPlugin.configs.strict)),
                        reactPlugin.configs.strict.rules),

                        // Recommended strict rules from eslint-plugin-react-you-might-not-need-an-effect
                        ...(assert.ok(!Array.isArray(reactYouMightNotNeedAnEffect.configs.strict)),
                        reactYouMightNotNeedAnEffect.configs.strict.rules),

                        // Opinionated React Hooks rules, although part of the recommended list.
                        // @see https://react.dev/reference/eslint-plugin-react-hooks#recommended
                        'react-hooks/globals': 'error',
                        'react-hooks/immutability': 'error',
                        'react-hooks/purity': 'error',
                        'react-hooks/refs': 'error',
                        'react-hooks/set-state-in-effect': 'off', // handled by eslint-plugin-react-you-might-not-need-an-effect
                        'react-hooks/set-state-in-render': 'error',
                        'react-hooks/static-components': 'error',
                        'react-hooks/unsupported-syntax': 'error',
                        'react-hooks/use-memo': 'error',

                        ...(stylisticEnabled && {
                            // Opinionated JSX-based @stylistic rules
                            '@stylistic/jsx-closing-bracket-location': ['error', 'line-aligned'],
                            '@stylistic/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
                            '@stylistic/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
                            '@stylistic/jsx-pascal-case': ['error', { allowAllCaps: true, ignore: [] }],
                            '@stylistic/jsx-self-closing-comp': 'error',
                            '@stylistic/jsx-tag-spacing': [
                                'error',
                                {
                                    afterOpening: 'never',
                                    closingSlash: 'never',
                                    beforeClosing: 'never',
                                    beforeSelfClosing: 'always',
                                },
                            ],
                            '@stylistic/jsx-wrap-multilines': [
                                'error',
                                {
                                    arrow: 'parens-new-line',
                                    assignment: 'parens-new-line',
                                    condition: 'ignore',
                                    declaration: 'parens-new-line',
                                    logical: 'ignore',
                                    prop: 'ignore',
                                    return: 'parens-new-line',
                                },
                            ],
                            '@stylistic/no-multi-spaces': 'error',
                        }),
                    }
                ),

                // Recommended rules from eslint-plugin-react-hooks, manually migrated
                // @see https://react.dev/reference/eslint-plugin-react-hooks
                'react-hooks/exhaustive-deps': ['error', { 'additionalHooks': `(${reactHooks})` }],
                'react-hooks/rules-of-hooks': 'error',

                // Recommended rules from eslint-plugin-react-refresh, manually migrated
                // @see https://github.com/ArnaudBarre/eslint-plugin-react-refresh
                'react-refresh/only-export-components': [
                    'warn',
                    {
                        allowConstantExport: isAllowConstantExport,
                        allowExportNames: [
                            ...(isUsingNextJS
                                ? [
                                    'config',
                                    'dynamic',
                                    'dynamicParams',
                                    'experimental_ppr',
                                    'fetchCache',
                                    'generateMetadata',
                                    'generateStaticParams',
                                    'generateViewport',
                                    'maxDuration',
                                    'metadata',
                                    'preferredRegion',
                                    'runtime',
                                    'viewport',
                                ]
                                : []),
                            ...(isUsingReactRouter || isUsingRemix
                                ? [
                                    'action',
                                    'clientAction',
                                    'clientloader',
                                    'handle',
                                    'headers',
                                    'links',
                                    'loader',
                                    'meta',
                                    'shouldRevalidate',
                                    'ErrorBoundary',
                                    'HydrateFallback',
                                ]
                                : []),
                        ],
                    },
                ],

                ...overrides,
            },
        },
        {
            name: 'moso/react/typescript',
            files: filesTypeAware,
            rules: {
                // Disable rules that are already handled by @typescript-eslint
                '@eslint-react/dom-no-string-style-prop': 'off',
                '@eslint-react/dom-no-unknown-property': 'off',
            },
        },
        ...((isTypeAware
            ? [{
                name: 'moso/react/typescript/type-aware-rules',
                files: filesTypeAware,
                ignores: ignoresTypeAware,
                rules: {
                    ...(lessOpinionated
                        ? {
                            ...(assert.ok(!Array.isArray(reactPlugin.configs['recommended-type-checked'])),
                            reactPlugin.configs['recommended-type-checked'].rules),
                        }
                        : {
                            ...(assert.ok(!Array.isArray(reactPlugin.configs['strict-type-checked'])),
                            reactPlugin.configs['strict-type-checked'].rules),

                            '@eslint-react/no-leaked-conditional-rendering': 'error',
                        }
                    ),

                    'react-hooks/exhaustive-deps': [
                        'error',
                        {
                            'additionalHooks': `(${reactHooks}|useAbortableEffect)`,
                        },
                    ],

                    '@typescript-eslint/class-methods-use-this': [
                        'error',
                        {
                            exceptMethods: [
                                'componentDidCatch',
                                'componentDidMount',
                                'componentDidUpdate',
                                'componentWillMount',
                                'componentWillReceiveProps',
                                'componentWillUnmount',
                                'componentWillUpdate',
                                'getChildContext',
                                'getDefaultProps',
                                'getInitialState',
                                'getSnapshotBeforeUpdate',
                                'render',
                                'shouldComponentUpdate',
                                'UNSAFE_componentWillMount',
                                'UNSAFE_componentWillReceiveProps',
                                'UNSAFE_componentWillUpdate',
                            ],
                            ignoreClassesThatImplementAnInterface: 'public-fields',
                        },
                    ],

                    ...overridesTypeAware,
                },
            }]
            : []) satisfies TypedFlatConfigItem[]
        ),
    ];
};
