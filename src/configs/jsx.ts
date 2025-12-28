import {
    ensurePackages,
    loadPackages,
    memoize,
} from '../utils';

import type { ESLint } from 'eslint';

import type {
    OptionsA11y,
    OptionsFiles,
    OptionsLessOpinionated,
    OptionsOverrides,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

export const jsx = async (
    options: Readonly<
        OptionsA11y &
        OptionsLessOpinionated &
        OptionsOverrides &
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

    if (a11y) await ensurePackages(['eslint-plugin-jsx-a11y']);

    const jsxA11yPlugin = a11y
        ? (await loadPackages(['eslint-plugin-jsx-a11y'])) as [ESLint.Plugin]
        : undefined;

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
        ...((a11y
            ? [
                {
                    name: 'moso/jsx/a11y',
                    plugins: {
                        'jsx-a11y': memoize(jsxA11yPlugin as ESLint.Plugin, 'eslint-plugin-jsx-a11y'),
                    },
                    rules: {
                        // Recommended rules from eslint-plugin-jsx-a11y, manually migrated
                        'jsx-a11y/alt-text': 'error',
                        'jsx-a11y/anchor-ambiguous-text': 'off',
                        'jsx-a11y/anchor-has-content': 'error',
                        'jsx-a11y/anchor-is-valid': 'error',
                        'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
                        'jsx-a11y/aria-props': 'error',
                        'jsx-a11y/aria-proptypes': 'error',
                        'jsx-a11y/aria-role': 'error',
                        'jsx-a11y/aria-unsupported-elements': 'error',
                        'jsx-a11y/autocomplete-valid': 'error',
                        'jsx-a11y/click-events-have-key-events': 'error',
                        'jsx-a11y/control-has-associated-label': [
                            'off',
                            {
                                ignoreElements: [
                                    'audio',
                                    'canvas',
                                    'embed',
                                    'input',
                                    'textarea',
                                    'tr',
                                    'video',
                                ],
                                ignoreRoles: [
                                    'grid',
                                    'listbox',
                                    'menu',
                                    'menubar',
                                    'radiogroup',
                                    'row',
                                    'tablist',
                                    'toolbar',
                                    'tree',
                                    'treegrid',
                                ],
                                includeRoles: ['alert', 'dialog'],
                            },
                        ],
                        'jsx-a11y/heading-has-content': 'error',
                        'jsx-a11y/html-has-lang': 'error',
                        'jsx-a11y/iframe-has-title': 'error',
                        'jsx-a11y/img-redundant-alt': 'error',
                        'jsx-a11y/interactive-supports-focus': [
                            'error',
                            {
                                tabbable: [
                                    ...(lessOpinionated
                                        ? [
                                            'button',
                                            'checkbox',
                                            'link',
                                            'searchbox',
                                            'spinbutton',
                                            'switch',
                                            'textbox',
                                        ]
                                        : [
                                            'button',
                                            'checkbox',
                                            'link',
                                            'progressbar',
                                            'searchbox',
                                            'slider',
                                            'spinbutton',
                                            'switch',
                                            'textbox',
                                        ]),
                                ],
                            },
                        ],
                        'jsx-a11y/label-has-associated-control': 'error',
                        'jsx-a11y/label-has-for': 'off',
                        'jsx-a11y/media-has-caption': 'error',
                        'jsx-a11y/mouse-events-have-key-events': 'error',
                        'jsx-a11y/no-access-key': 'error',
                        'jsx-a11y/no-autofocus': 'error',
                        'jsx-a11y/no-distracting-elements': 'error',
                        'jsx-a11y/no-interactive-element-to-noninteractive-role': [
                            'error',
                            ...(lessOpinionated
                                ? [{
                                    tr: ['none', 'presentation'],
                                    canvas: ['img'],
                                }]
                                : []),
                        ],
                        'jsx-a11y/no-noninteractive-element-interactions': [
                            'error',
                            ...(lessOpinionated
                                ? [{
                                    handlers: [
                                        'onClick',
                                        'onError',
                                        'onLoad',
                                        'onMouseDown',
                                        'onMouseUp',
                                        'onKeyPress',
                                        'onKeyDown',
                                        'onKeyUp',
                                    ],
                                    alert: [
                                        'onKeyUp',
                                        'onKeyDown',
                                        'onKeyPress',
                                    ],
                                    body: ['onError', 'onLoad'],
                                    dialog: [
                                        'onKeyUp',
                                        'onKeyDown',
                                        'onKeyPress',
                                    ],
                                    iframe: ['onError', 'onLoad'],
                                    img: ['onError', 'onLoad'],
                                }]
                                : [{
                                    body: ['onError', 'onLoad'],
                                    iframe: ['onError', 'onLoad'],
                                    img: ['onError', 'onLoad'],
                                }]),
                        ],
                        'jsx-a11y/no-noninteractive-element-to-interactive-role': [
                            'error',
                            ...(lessOpinionated
                                ? [{
                                    ul: [
                                        'listbox',
                                        'menu',
                                        'menubar',
                                        'radiogroup',
                                        'tablist',
                                        'tree',
                                        'treegrid',
                                    ],
                                    ol: [
                                        'listbox',
                                        'menu',
                                        'menubar',
                                        'radiogroup',
                                        'tablist',
                                        'tree',
                                        'treegrid',
                                    ],
                                    li: [
                                        'menuitem',
                                        'menuitemradio',
                                        'menuitemcheckbox',
                                        'option',
                                        'row',
                                        'tab',
                                        'treeitem',
                                    ],
                                    table: ['grid'],
                                    td: ['gridcell'],
                                    fieldset: ['radiogroup', 'presentation'],
                                }]
                                : []),
                        ],
                        'jsx-a11y/no-noninteractive-tabindex': [
                            'error',
                            ...(lessOpinionated
                                ? [{
                                    tags: [],
                                    roles: ['tabpanel'],
                                    allowExpressionValues: true,
                                }]
                                : []),
                        ],
                        'jsx-a11y/no-redundant-roles': 'error',
                        'jsx-a11y/no-static-element-interactions': [
                            'error',
                            ...(lessOpinionated
                                ? [{
                                    allowExpressionValues: true,
                                    handlers: [
                                        'onClick',
                                        'onMouseDown',
                                        'onMouseUp',
                                        'onKeyPress',
                                        'onKeyDown',
                                        'onKeyUp',
                                    ],
                                }]
                                : []),
                        ],
                        'jsx-a11y/role-has-required-aria-props': 'error',
                        'jsx-a11y/role-supports-aria-props': 'error',
                        'jsx-a11y/scope': 'error',
                        'jsx-a11y/tabindex-no-positive': 'error',

                        ...overridesA11y,
                    },
                },
            ]
            : []) satisfies TypedFlatConfigItem[]
        ),
    ];
};
