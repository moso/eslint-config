import { isPackageExists } from 'local-pkg';

import { GLOB_MARKDOWN, GLOB_SRC, GLOB_TS, GLOB_TSX } from '../globs';
import { interopDefault } from '../utils';

import type {
    OptionsFiles,
    OptionsOverrides,
    OptionsTypeScriptParserOptions,
    OptionsTypeScriptWithTypes,
    TypedFlatConfigItem,
} from '../types';

const ReactRefreshAllowConstantExportPackages = [
    'vite',
];

const RemixPackages = [
    '@remix-run/node',
    '@remix-run/react',
    '@remix-run/serve',
    '@remix-run/dev',
];

const ReactRouterPackages = [
    '@react-router/node',
    '@react-router/react',
    '@react-router/serve',
    '@react-router/dev',
];

const NextJsPackages = [
    'next',
];

export const react = async (options:
    OptionsTypeScriptParserOptions &
    OptionsTypeScriptWithTypes &
    OptionsOverrides &
    OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> => {
    const {
        files = [GLOB_SRC],
        filesTypeAware = [GLOB_TS, GLOB_TSX],
        ignoresTypeAware = [`${GLOB_MARKDOWN}/**`],
        overrides = {},
        tsconfigPath,
    } = options;

    const isTypeAware = !!tsconfigPath;

    const typeAwareRules: TypedFlatConfigItem['rules'] = {
        '@eslint-react/dom/no-unknown-property': 'off',
        '@eslint-react/no-duplicate-jsx-props': 'off',
        '@eslint-react/use-jsx-vars': 'off',
        '@eslint-react/no-leaked-conditional-rendering': 'warn',
    };

    const [
        reactPlugin,
        reactHooksPlugin,
        reactRefreshPlugin,
    ] = await Promise.all([
        interopDefault(import('@eslint-react/eslint-plugin')),
        interopDefault(import('eslint-plugin-react-hooks')),
        interopDefault(import('eslint-plugin-react-refresh')),
    ] as const);

    const isAllowConstantExport = ReactRefreshAllowConstantExportPackages.some((x) => isPackageExists(x));
    const isUsingRemix = RemixPackages.some((x) => isPackageExists(x));
    const isUsingReactRouter = ReactRouterPackages.some((x) => isPackageExists(x));
    const isUsingNext = NextJsPackages.some((x) => isPackageExists(x));

    const plugins = reactPlugin.configs.all.plugins;

    return [
        {
            name: 'moso/react/setup',
            plugins: {
                '@eslint-react': plugins['@eslint-react'],
                '@eslint-react/dom': plugins['@eslint-react/dom'],
                '@eslint-react/hooks-extra': plugins['@eslint-react/hooks-extra'],
                '@eslint-react/naming-convention': plugins['@eslint-react/naming-convention'],
                '@eslint-react/web-api': plugins['@eslint-react/web-api'],
                'react-hooks': reactHooksPlugin,
                'react-refresh': reactRefreshPlugin,
            },
        },
        {
            files,
            languageOptions: {
                parserOptions: {
                    ecmaFeatures: {
                        jsx: true,
                    },
                },
                sourceType: 'module',
            },
            name: 'moso/react/rules',
            rules: {
                // Recommended rules from @eslint-react/react-x
                // @see https://eslint-react.xyz/docs/rules/overview#core-rules
                '@eslint-react/jsx-no-duplicate-props': 'error',
                '@eslint-react/jsx-no-undef': 'error',
                '@eslint-react/no-access-state-in-setstate': 'error',
                '@eslint-react/no-array-index-key': 'warn',
                '@eslint-react/no-children-count': 'warn',
                '@eslint-react/no-children-for-each': 'warn',
                '@eslint-react/no-children-map': 'warn',
                '@eslint-react/no-children-only': 'warn',
                '@eslint-react/no-children-to-array': 'warn',
                '@eslint-react/no-clone-element': 'warn',
                '@eslint-react/no-comment-textnodes': 'warn',
                '@eslint-react/no-component-will-mount': 'error',
                '@eslint-react/no-component-will-receive-props': 'error',
                '@eslint-react/no-component-will-update': 'error',
                '@eslint-react/no-context-provider': 'warn',
                '@eslint-react/no-create-ref': 'error',
                '@eslint-react/no-default-props': 'error',
                '@eslint-react/no-direct-mutation-state': 'error',
                '@eslint-react/no-duplicate-jsx-props': 'warn',
                '@eslint-react/no-duplicate-key': 'warn',
                '@eslint-react/no-forward-ref': 'warn',
                '@eslint-react/no-implicit-key': 'warn',
                '@eslint-react/no-missing-key': 'error',
                '@eslint-react/no-nested-component-definitions': 'error',
                '@eslint-react/no-prop-types': 'error',
                '@eslint-react/no-redundant-should-component-update': 'error',
                '@eslint-react/no-set-state-in-component-did-mount': 'warn',
                '@eslint-react/no-set-state-in-component-did-update': 'warn',
                '@eslint-react/no-set-state-in-component-will-update': 'warn',
                '@eslint-react/no-string-refs': 'error',
                '@eslint-react/no-unsafe-component-will-mount': 'warn',
                '@eslint-react/no-unsafe-component-will-receive-props': 'warn',
                '@eslint-react/no-unsafe-component-will-update': 'warn',
                '@eslint-react/no-unstable-context-value': 'warn',
                '@eslint-react/no-unstable-default-props': 'warn',
                '@eslint-react/no-unused-class-component-members': 'warn',
                '@eslint-react/no-unused-state': 'warn',
                '@eslint-react/no-use-context': 'warn',
                '@eslint-react/no-useless-forward-ref': 'warn',
                '@eslint-react/use-jsx-vars': 'warn',

                // Recommended rules from @eslint-react/dom
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
                '@eslint-react/dom/no-unsafe-iframe-sandbox': 'warn',
                '@eslint-react/dom/no-unsafe-target-blank': 'warn',
                '@eslint-react/dom/no-use-form-state': 'error',
                '@eslint-react/dom/no-void-elements-with-children': 'error',

                // Recommended rules for eslint-plugin-react-hooks
                // @see https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks/src/rules
                'react-hooks/exhaustive-deps': 'warn',
                'react-hooks/rules-of-hooks': 'error',

                // Recommended rules for eslint-plugin-react-hooks-extra
                // @see https://eslint-react.xyz/docs/rules/overview#hooks-extra-rules
                '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect': 'warn',
                '@eslint-react/hooks-extra/no-useless-custom-hooks': 'warn',
                '@eslint-react/hooks-extra/prefer-use-state-lazy-initialization': 'warn',

                // Recommended rules from @eslint-react/web-api
                // @see https://eslint-react.xyz/docs/rules/overview#web-api-rules
                '@eslint-react/web-api/no-leaked-event-listener': 'warn',
                '@eslint-react/web-api/no-leaked-interval': 'warn',
                '@eslint-react/web-api/no-leaked-resize-observer': 'warn',
                '@eslint-react/web-api/no-leaked-timeout': 'warn',

                // Preconfigured rules from eslint-plugin-react-refresh
                // @see https://github.com/ArnaudBarre/eslint-plugin-react-refresh/tree/main/src
                'react-refresh/only-export-components': [
                    'warn',
                    {
                        allowConstantExport: isAllowConstantExport,
                        allowExportNames: [
                            ...(isUsingNext
                                ? [
                                    'dynamic',
                                    'dynamicParams',
                                    'revalidate',
                                    'fetchCache',
                                    'runtime',
                                    'preferredRegion',
                                    'maxDuration',
                                    'config',
                                    'generateStaticParams',
                                    'metadata',
                                    'generateMetadata',
                                    'viewport',
                                    'generateViewport',
                                ]
                                : []
                            ),

                            ...(isUsingRemix || isUsingReactRouter
                                ? [
                                    'meta',
                                    'links',
                                    'headers',
                                    'loader',
                                    'action',
                                ]
                                : []
                            ),
                        ],
                    },
                ],

                // @moso's rules
                '@eslint-react/naming-convention/context-name': 'warn',
                '@eslint-react/naming-convention/use-state': 'warn',

                '@eslint-react/ensure-forward-ref-using-ref': 'warn',
                '@eslint-react/no-nested-components': 'error',
                '@eslint-react/prefer-destructuring-assignment': 'warn',
                '@eslint-react/prefer-shorthand-boolean': 'warn',
                '@eslint-react/prefer-shorthand-fragment': 'warn',

                ...overrides,
            },
        },

        ...isTypeAware
            ? [
                {
                    files: filesTypeAware,
                    ignores: ignoresTypeAware,
                    name: 'moso/react/type-aware-rules',
                    rules: {
                        ...typeAwareRules,
                    },
                },
            ]
            : [],
    ];
};
