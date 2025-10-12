import assert from 'node:assert/strict';

import { isPackageExists } from 'local-pkg';

import {
    ensurePackages,
    interopDefault,
    loadPackages,
    memoize,
} from '../utils';

import type { ESLint } from 'eslint';

import type {
    OptionsFiles,
    OptionsHasTypeScript,
    OptionsLessOpinionated,
    OptionsOverrides,
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
        OptionsOverrides &
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
        a11y,
        additionalComponents = [{
            name: 'Link',
            as: 'a',
            attributes: [
                { name: 'to', as: 'href' },
                { name: 'rel', as: 'rel' },
            ],
        }],
        additionalHooks = 'useIsomorphicLayoutEffect',
        additionalHooksWithType = {
            useEffect: ['useAbortableEffect'],
            useLayoutEffect: ['useIsomorphicLayoutEffect'],
        },
        files,
        filesTypeAware,
        lessOpinionated,
        overrides,
        overridesA11y,
        overridesTypeAware,
        parserOptions,
        projectRoot,
        stylistic,
        typescript,
    } = options;

    await ensurePackages([
        '@eslint-react/eslint-plugin',
        'eslint-plugin-react-hooks',
        'eslint-plugin-react-refresh',
        'eslint-plugin-react-you-might-not-need-an-effect',
    ]);

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
        ESLint.Plugin,
        ESLint.Plugin,
        ESLint.Plugin,
        (typeof import('eslint-plugin-react-you-might-not-need-an-effect'))['default'],
    ];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const plugins = ((reactPlugin.configs?.all as any)?.plugins as Record<string, ESLint.Plugin> | undefined) ??
        assert.fail('Failed to load React plugins.');

    const isTypeAware = typeof projectRoot === 'string';

    const isAllowConstantExport = ReactRefreshAllowConstantExportPackages.some((x) => isPackageExists(x));
    const isUsingAstro = isPackageExists('@astrojs/react');

    const isUsingRemix = RemixPackages.some((x) => isPackageExists(x));
    const isUsingReactRouter = ReactRouterPackages.some((x) => isPackageExists(x));

    if (a11y) await ensurePackages(['eslint-plugin-jsx-a11y']);

    const jsxA11yPlugin = a11y
        ? (await loadPackages(['eslint-plugin-jsx-a11y'])) as [ESLint.Plugin]
        : undefined;

    const stylisticEnabled = stylistic !== false;

    const typescriptParser = typescript ? (await interopDefault(import('@typescript-eslint/parser'))) : undefined;

    return [
        {
            name: 'moso/react',
            files,
            plugins: {
                '@eslint-react': memoize(plugins['@eslint-react'], '@eslint-react'),
                '@eslint-react/dom': memoize(plugins['@eslint-react/dom'], '@eslint-react/dom'),
                '@eslint-react/hooks-extra': memoize(plugins['@eslint-react/hooks-extra'], '@eslint-react/hooks-extra'),
                '@eslint-react/naming-convention': memoize(plugins['@eslint-react/naming-convention'], '@eslint-react/naming-convention'),
                '@eslint-react/web-api': memoize(plugins['@eslint-react/web-api'], '@eslint-react/web-api'),
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
                    ...(typescript ? parserOptions : undefined),
                },
                sourceType: 'module',
            },
            settings: {
                '@eslint-react': {
                    additionalHooks: additionalHooksWithType,
                    additionalComponents,
                    version: 'detect',
                },
            },
            rules: {
                // Recommended rules from eslint-plugin-react-x, manually migrated
                // @see https://eslint-react.xyz/docs/rules/overview#core-rules
                '@eslint-react/jsx-no-comment-textnodes': 'warn',
                '@eslint-react/jsx-no-duplicate-props': 'warn',
                '@eslint-react/jsx-uses-react': 'warn',
                '@eslint-react/jsx-uses-vars': 'warn',
                '@eslint-react/no-access-state-in-setstate': 'error',
                '@eslint-react/no-array-index-key': 'warn',
                '@eslint-react/no-children-count': 'warn',
                '@eslint-react/no-children-for-each': 'warn',
                '@eslint-react/no-children-map': 'warn',
                '@eslint-react/no-children-only': 'warn',
                '@eslint-react/no-children-to-array': 'warn',
                '@eslint-react/no-clone-element': 'warn',
                '@eslint-react/no-component-will-mount': 'error',
                '@eslint-react/no-component-will-receive-props': 'error',
                '@eslint-react/no-component-will-update': 'error',
                '@eslint-react/no-context-provider': 'warn',
                '@eslint-react/no-create-ref': 'error',
                '@eslint-react/no-default-props': 'error',
                '@eslint-react/no-direct-mutation-state': 'error',
                '@eslint-react/no-duplicate-key': 'warn',
                '@eslint-react/no-forward-ref': 'warn',
                '@eslint-react/no-implicit-key': 'warn',
                '@eslint-react/no-missing-key': 'error',
                '@eslint-react/no-misused-capture-owner-stack': 'error',
                '@eslint-react/no-nested-component-definitions': 'error',
                '@eslint-react/no-nested-lazy-component-declarations': 'warn',
                '@eslint-react/no-prop-types': 'error',
                '@eslint-react/no-redundant-should-component-update': 'error',
                '@eslint-react/no-set-state-in-component-did-mount': 'warn',
                '@eslint-react/no-set-state-in-component-did-update': 'warn',
                '@eslint-react/no-set-state-in-component-will-update': 'warn',
                '@eslint-react/no-string-refs': 'error',
                '@eslint-react/no-unnecessary-use-prefix': 'warn',
                '@eslint-react/no-unsafe-component-will-mount': 'warn',
                '@eslint-react/no-unsafe-component-will-receive-props': 'warn',
                '@eslint-react/no-unsafe-component-will-update': 'warn',
                '@eslint-react/no-unstable-context-value': 'warn',
                '@eslint-react/no-unstable-default-props': 'warn',
                '@eslint-react/no-unused-class-component-members': 'warn',
                '@eslint-react/no-unused-state': 'warn',
                '@eslint-react/no-use-context': 'warn',
                '@eslint-react/no-useless-forward-ref': 'warn',
                '@eslint-react/prefer-use-state-lazy-initialization': 'warn',

                // Recommended rules from eslint-plugin-react-dom, manually migrated
                // @see https://eslint-react.xyz/docs/rules/overview#dom-rules
                '@eslint-react/dom/no-dangerously-set-innerhtml': 'warn',
                '@eslint-react/dom/no-dangerously-set-innerhtml-with-children': 'error',
                '@eslint-react/dom/no-find-dom-node': 'error',
                '@eslint-react/dom/no-flush-sync': 'error',
                '@eslint-react/dom/no-hydrate': 'error',
                '@eslint-react/dom/no-missing-button-type': 'warn',
                '@eslint-react/dom/no-missing-iframe-sandbox': 'warn',
                '@eslint-react/dom/no-namespace': 'error',
                '@eslint-react/dom/no-render': 'error',
                '@eslint-react/dom/no-render-return-value': 'error',
                '@eslint-react/dom/no-script-url': 'warn',
                '@eslint-react/dom/no-string-style-prop': 'error',
                '@eslint-react/dom/no-unsafe-iframe-sandbox': 'warn',
                '@eslint-react/dom/no-unsafe-target-blank': 'warn',
                '@eslint-react/dom/no-use-form-state': 'error',
                '@eslint-react/dom/no-void-elements-with-children': 'error',

                // Recommended rules from eslint-plugin-react-naming-convention, manually migrated
                // @see https://eslint-react.xyz/docs/rules/overview#naming-convention-rules
                '@eslint-react/naming-convention/context-name': 'warn',
                '@eslint-react/naming-convention/use-state': 'error',

                // Recommended rules from eslint-plugin-react-hooks, manually migrated
                // @see https://react.dev/reference/eslint-plugin-react-hooks
                'react-hooks/exhaustive-deps': ['error', { additionalHooks }],
                'react-hooks/rules-of-hooks': 'error',

                // Recommended rules from eslint-plugin-react-hooks-extra, manually migrated
                // @see https://eslint-react.xyz/docs/rules/overview#hooks-extra-rules
                '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect': 'warn',

                // Recommended rules from eslint-plugin-react-refresh, manually migrated
                // @see https://github.com/ArnaudBarre/eslint-plugin-react-refresh
                'react-refresh/only-export-components': [
                    'warn',
                    {
                        allowConstantExport: isAllowConstantExport,
                        allowExportNames: [
                            ...(isUsingRemix
                                ? [
                                    'action',
                                    'headers',
                                    'links',
                                    'loader',
                                    'meta',
                                ]
                                : []),
                            ...(isUsingReactRouter
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

                // Recommended rules from eslint-plugin-react-web-api, manually migrated
                // @see https://eslint-react.xyz/docs/rules/overview#web-api-rules
                '@eslint-react/web-api/no-leaked-event-listener': 'warn',
                '@eslint-react/web-api/no-leaked-interval': 'warn',
                '@eslint-react/web-api/no-leaked-resize-observer': 'warn',
                '@eslint-react/web-api/no-leaked-timeout': 'warn',

                ...(!lessOpinionated && {
                    '@eslint-react/jsx-shorthand-fragment': 'error',
                    '@eslint-react/jsx-key-before-spread': 'error',
                    '@eslint-react/no-leaked-conditional-rendering': 'error',
                    '@eslint-react/no-unnecessary-use-callback': 'error',
                    '@eslint-react/no-unnecessary-use-memo': 'error',
                    '@eslint-react/no-unstable-context-value': 'error',
                    '@eslint-react/no-unstable-default-props': 'error',
                    '@eslint-react/no-useless-fragment': 'error',

                    '@eslint-react/dom/no-void-elements-with-children': 'error',

                    '@eslint-react/naming-convention/component-name': [
                        isUsingAstro ? 'off' : 'error',
                        {
                            rule: 'PascalCase',
                        },
                    ],
                    '@eslint-react/naming-convention/filename': [
                        isUsingAstro ? 'off' : 'error',
                        {
                            rule: 'kebab-case',
                        },
                    ],
                    '@eslint-react/naming-convention/filename-extension': [
                        isUsingAstro ? 'off' : 'error',
                        {
                            allow: 'as-needed',
                        },
                    ],

                    // Recommended rules from eslint-plugin-react-you-might-not-need-an-effect, manually migrated
                    // @see https://react.dev/learn/you-might-not-need-an-effect
                    'react-you-might-not-need-an-effect/no-adjust-state-on-prop-change': 'warn',
                    'react-you-might-not-need-an-effect/no-chain-state-updates': 'warn',
                    'react-you-might-not-need-an-effect/no-derived-state': 'warn',
                    'react-you-might-not-need-an-effect/no-empty-effect': 'warn',
                    'react-you-might-not-need-an-effect/no-event-handler': 'warn',
                    'react-you-might-not-need-an-effect/no-initialize-state': 'warn',
                    'react-you-might-not-need-an-effect/no-manage-parent': 'warn',
                    'react-you-might-not-need-an-effect/no-pass-data-to-parent': 'warn',
                    'react-you-might-not-need-an-effect/no-pass-live-state-to-parent': 'warn',
                    'react-you-might-not-need-an-effect/no-reset-all-state-on-prop-change': 'warn',

                    ...(stylisticEnabled && {
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
                }),

                ...overrides,
            },
        },

        ...((isTypeAware
            ? [{
                name: 'moso/react/rules-type-aware',
                files: filesTypeAware,
                rules: {
                    '@eslint-react/dom/no-unknown-property': 'off',
                    '@eslint-react/jsx-no-duplicate-props': 'off',
                    '@eslint-react/jsx-uses-react': 'off',
                    '@eslint-react/jsx-uses-vars': 'off',

                    '@eslint-react/no-leaked-conditional-rendering': 'warn',
                    // '@eslint-react/prefer-read-only-props': 'warn',

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

        ...((a11y
            ? [
                {
                    name: 'moso/react/a11y',
                    plugins: {
                        'jsx-a11y': memoize(jsxA11yPlugin as ESLint.Plugin, 'eslint-plugin-jsx-a11y'),
                    },
                    rules: {
                        // Minimal rules, inspired by SukkaW
                        // @see https://github.com/SukkaW/eslint-config-sukka/tree/master/packages/eslint-plugin-react-jsx-a11y
                        'jsx-a11y/alt-text': ['warn', { elements: ['img'], img: ['Image'] }],
                        'jsx-a11y/aria-props': 'warn',
                        'jsx-a11y/aria-proptypes': 'warn',
                        'jsx-a11y/aria-role': 'warn',
                        'jsx-a11y/aria-unsupported-elements': 'warn',
                        'jsx-a11y/iframe-has-title': 'warn',
                        'jsx-a11y/no-access-key': 'warn',
                        'jsx-a11y/role-has-required-aria-props': 'warn',
                        'jsx-a11y/role-supports-aria-props': 'warn',
                        'jsx-a11y/tabindex-no-positive': 'warn',

                        ...overridesA11y,
                    },
                },
            ]
            : []) satisfies TypedFlatConfigItem[]
        ),
    ];
};
