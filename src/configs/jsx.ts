import assert from 'node:assert/strict';

import { loadPackages, memoize } from '../utils';

import type {
    OptionsFiles,
    OptionsJSX,
    OptionsLessOpinionated,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

export const jsx = async (
    options: Readonly<
        OptionsJSX &
        OptionsLessOpinionated &
        Required<OptionsFiles & RequiredOptionsStylistic>
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        a11y,
        files,
        lessOpinionated,
        overrides,
        overridesA11y,
        stylistic,
    } = options;

    const [jsxA11yPlugin] = a11y
        ? ((await loadPackages(['eslint-plugin-jsx-a11y'])) as [typeof import('eslint-plugin-jsx-a11y')])
        : [undefined];

    const stylisticEnabled = stylistic !== false;

    return [
        {
            name: 'moso/jsx/setup',
            files,
            languageOptions: {
                parserOptions: {
                    ecmaFeatures: {
                        jsx: true,
                    },
                },
            },
        },
        {
            name: 'moso/jsx/rules',
            rules: {
                ...(stylisticEnabled && {
                    '@stylistic/jsx-curly-spacing': [
                        'error',
                        {
                            'when': 'always',
                            'allowMultiline': false,
                            'children': false,
                            'spacing': {
                                'objectLiterals': 'never',
                            },
                        },
                    ],
                    '@stylistic/jsx-one-expression-per-line': 'off',
                }),

                ...overrides,
            },
        },
        ...((jsxA11yPlugin
            ? [
                {
                    name: 'moso/jsx/a11y',
                    plugins: {
                        'jsx-a11y': memoize(jsxA11yPlugin, 'eslint-plugin-jsx-a11y'),
                    },
                    rules: {
                        ...(lessOpinionated
                            ? {
                                ...(assert.ok(!Array.isArray(jsxA11yPlugin.flatConfigs.recommended)),
                                jsxA11yPlugin.flatConfigs.recommended.rules),
                            }
                            : {
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
                            }
                        ),

                        ...overridesA11y,
                    },
                },
            ]
            : []) satisfies TypedFlatConfigItem[]
        ),
    ];
};
