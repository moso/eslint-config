import assert from 'node:assert/strict';

import { loadPackages } from '../tools';
import { memoize } from '../utils';

import type {
    OptionsFiles,
    OptionsHasTypeScript,
    OptionsLessOpinionated,
    OptionsPreact,
    OptionsTypeScriptParserOptions,
    OptionsTypeScriptWithTypes,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

export const preact = async (
    options: Readonly<
        OptionsLessOpinionated &
        OptionsPreact &
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
        files,
        filesTypeAware,
        ignoresTypeAware,
        lessOpinionated,
        overrides,
        overridesA11y,
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
    ] = await loadPackages([
        '@eslint-react/eslint-plugin',
        'eslint-plugin-react-hooks',
        'eslint-plugin-react-refresh',
    ]);

    const isTypeAware = typescript && typeof projectRoot === 'string' && parserOptions?.projectService !== false;

    const [jsxA11yPlugin] = a11y
        ? await loadPackages(['eslint-plugin-jsx-a11y'])
        : [undefined];

    const stylisticEnabled = stylistic !== false;

    const [typescriptParser] = typescript
        ? await loadPackages(['@typescript-eslint/parser'])
        : [undefined];

    return [
        {
            name: 'moso/preact/setup',
            plugins: {
                '@eslint-react': memoize(reactPlugin, '@eslint-react'),
                'react-hooks': memoize(reactHooksPlugin, 'eslint-plugin-react-hooks'),
                'react-refresh': memoize(reactRefreshPlugin, 'eslint-plugin-react-refresh'),
                ...jsxA11yPlugin && { 'jsx-a11y': memoize(jsxA11yPlugin, 'eslint-plugin-jsx-a11y') },
            },
        },
        {
            name: 'moso/preact/rules',
            files,
            languageOptions: {
                parser: typescript ? typescriptParser : undefined,
                parserOptions: {
                    ecmaFeatures: { jsx: true },
                    ...(typescript && parserOptions),
                },
                sourceType: 'module',
            },
            rules: {
                ...(lessOpinionated
                    ? {
                        // Recommended rules from @eslint-react
                        ...(assert.ok(!Array.isArray(reactPlugin.configs.recommended)),
                        reactPlugin.configs.recommended.rules),
                    }
                    : {
                        // Recommended strict rules from @eslint-react
                        ...(assert.ok(!Array.isArray(reactPlugin.configs.strict)),
                        reactPlugin.configs.strict.rules),

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

                // Recommended rules from eslint-plugin-react-hooks.
                ...(assert.ok(!Array.isArray(reactHooksPlugin.configs?.['recommended-latest'])),
                reactHooksPlugin.configs?.['recommended-latest'].rules),

                // Vite preset rules from eslint-plugin-react-refresh, manually migrated.
                // `@preact/preset-vite` runs Prefresh, which has the same constraints
                // @see https://github.com/ArnaudBarre/eslint-plugin-react-refresh
                'react-refresh/only-export-components': [
                    'error',
                    {
                        allowCompoundComponents: true,
                        allowConstantExport: true,
                    },
                ],

                ...(jsxA11yPlugin && {
                    // Minimal rules, inspired by SukkaW
                    // @see https://github.com/SukkaW/eslint-config-sukka/tree/master/packages/eslint-plugin-react-jsx-a11y
                    'jsx-a11y/alt-text': ['warn', { elements: ['img'], img: ['Image'] }],
                    'jsx-a11y/aria-props': 'warn',
                    'jsx-a11y/aria-proptypes': 'warn',
                    'jsx-a11y/aria-role': 'warn',
                    'jsx-a11y/aria-unsupported-elements': 'warn',
                    'jsx-a11y/iframe-has-title': 'warn',
                    'jsx-a11y/no-access-key': 'warn',
                    'jsx-a11y/no-static-element-interactions': 'warn',
                    'jsx-a11y/role-has-required-aria-props': 'warn',
                    'jsx-a11y/role-supports-aria-props': 'warn',
                    'jsx-a11y/tabindex-no-positive': 'warn',

                    // Opinionated additions
                    'jsx-a11y/anchor-ambiguous-text': 'off',
                    'jsx-a11y/interactive-supports-focus': [
                        'error',
                        {
                            tabbable: [
                                'button',
                                'checkbox',
                                'link',
                                'progressbar',
                                'searchbox',
                                'slider',
                                'spinbutton',
                                'switch',
                                'textbox',
                            ],
                        },
                    ],
                    'jsx-a11y/label-has-for': 'off',
                    'jsx-a11y/no-noninteractive-element-interactions': [
                        'error',
                        {
                            body: ['onError', 'onLoad'],
                            iframe: ['onError', 'onLoad'],
                            img: ['onError', 'onLoad'],
                        },
                    ],

                    ...overridesA11y,
                }),

                ...overrides,
            },
        },
        ...((isTypeAware
            ? [{
                name: 'moso/preact/typescript/type-aware-rules',
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
                        }
                    ),

                    ...overridesTypeAware,
                },
            }]
            : []) satisfies TypedFlatConfigItem[]
        ),
    ];
};
