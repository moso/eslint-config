import inlineElements from 'eslint-plugin-vue/lib/utils/inline-non-void-elements.json' with { type: 'json' };
import { isPackageExists } from 'local-pkg';

import { GLOB_SRC_EXT } from '../globs';
import {
    ensurePackages,
    interopDefault,
    loadPackages,
    memoize,
} from '../utils';

import type { ESLint, Linter } from 'eslint';

import type {
    OptionsFiles,
    OptionsHasTypeScript,
    OptionsOverrides,
    OptionsStylistic,
    OptionsTypeScriptParserOptions,
    OptionsTypeScriptWithTypes,
    OptionsVue,
    TypedFlatConfigItem,
} from '../types';

type VuePlugin = ESLint.Plugin & Omit<VuePluginImportedType, 'processors'> & {
    processors: Record<keyof VuePluginImportedType['processors'], Linter.Processor>;
};

type VuePluginImportedType = typeof import('eslint-plugin-vue');

const NuxtPackages = ['nuxt'];

export const vue = async (
    options: Readonly<
        OptionsOverrides &
        OptionsTypeScriptWithTypes &
        OptionsVue &
        Required<
            OptionsFiles &
            OptionsHasTypeScript &
            OptionsStylistic &
            OptionsTypeScriptParserOptions
        >
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        a11y,
        files,
        filesTypeAware,
        overrides,
        overridesA11y,
        overridesTypeAware,
        parserOptions,
        projectRoot,
        stylistic,
        typescript,
    } = options;

    const { indent = 4 } = typeof stylistic === 'boolean' ? {} : stylistic;

    await ensurePackages(['eslint-plugin-vue']);

    if (a11y) await ensurePackages(['eslint-plugin-vuejs-accessibility']);

    const [
        vuePlugin,
        vueParser,
        processorVueBlocks,
        { mergeProcessors },
    ] = (await loadPackages([
        'eslint-plugin-vue',
        'vue-eslint-parser',
        'eslint-processor-vue-blocks',
        'eslint-merge-processors',
    ])) as [
        VuePlugin,
        Linter.Parser,
        (typeof import('eslint-processor-vue-blocks'))['default'],
        typeof import('eslint-merge-processors'),
    ];

    const [vueA11yPlugin] = await Promise.all([
        ...a11y ? [interopDefault(import('eslint-plugin-vuejs-accessibility'))] : [],
    ]);

    const isTypeAware = typeof projectRoot === 'string';

    const isUsingNuxt = NuxtPackages.some((x) => isPackageExists(x));

    const sfcBlocks = options.sfcBlocks === true ? {} : options.sfcBlocks;

    const stylisticEnabled = stylistic !== false;

    const typescriptParser = typescript ? (await loadPackages(['@typescript-eslint/parser'])) as [Linter.Parser] : undefined;

    return [
        {
            name: 'moso/vue/setup',
            languageOptions: {
                globals: {
                    computed: 'readonly',
                    defineEmits: 'readonly',
                    defineExpose: 'readonly',
                    defineProps: 'readonly',
                    onMounted: 'readonly',
                    onUnmounted: 'readonly',
                    reactive: 'readonly',
                    ref: 'readonly',
                    shallowReactive: 'readonly',
                    shallowRef: 'readonly',
                    toRef: 'readonly',
                    toRefs: 'readonly',
                    watch: 'readonly',
                    watchEffect: 'readonly',
                },
            },
            plugins: {
                'vue': memoize(vuePlugin, 'eslint-plugin-vue'),
            },
        },
        {
            name: 'moso/vue/rules',
            files,
            languageOptions: {
                parser: memoize(vueParser, 'vue-eslint-parser'),
                parserOptions: {
                    ecmaFeatures: {
                        jsx: true,
                    },
                    extraFileExtensions: ['.vue'],
                    parser: typescript ? typescriptParser : null,
                    ...(typescript ? parserOptions : undefined),
                    sourceType: 'module',
                },
            },
            processor: sfcBlocks === false
                ? vuePlugin.processors['.vue']
                : mergeProcessors([
                    vuePlugin.processors['.vue'],
                    processorVueBlocks({
                        ...sfcBlocks,
                        blocks: {
                            styles: true,
                            ...sfcBlocks?.blocks,
                        },
                    }),
                ]),
            rules: {
                ...vuePlugin.configs.base.rules,

                // eslint-disable-next-line @moso/prefer-reduce-over-chaining -- mismatch
                ...vuePlugin.configs['flat/essential']
                    .map((config) => config.rules ?? {})
                    .reduce((acc, rules) => Object.assign(acc, rules), {}),

                // eslint-disable-next-line @moso/prefer-reduce-over-chaining -- mismatch
                ...vuePlugin.configs['flat/strongly-recommended']
                    .map((config) => config.rules ?? {})
                    .reduce((acc, rules) => Object.assign(acc, rules), {}),

                // eslint-disable-next-line @moso/prefer-reduce-over-chaining -- mismatch
                ...vuePlugin.configs['flat/recommended']
                    .map((config) => config.rules ?? {})
                    .reduce((acc, rules) => Object.assign(acc, rules), {}),

                'node/prefer-global/process': 'off',

                'vue/block-order': [
                    'error',
                    {
                        order: [
                            'script',
                            'template',
                            'style',
                        ],
                    },
                ],
                'vue/component-name-in-template-casing': ['error', 'PascalCase'],
                'vue/component-options-name-casing': ['error', 'PascalCase'],
                'vue/custom-event-name-casing': ['error', 'camelCase'],
                'vue/define-macros-order': [
                    'error',
                    {
                        order: [
                            'defineOptions',
                            'defineProps',
                            'defineEmits',
                            'defineSlots',
                        ],
                    },
                ],
                'vue/dot-location': ['error', 'property'],
                'vue/dot-notation': ['error', { allowKeywords: true }],
                'vue/eqeqeq': ['error', 'smart'],
                'vue/html-self-closing': 'off',
                'vue/max-attributes-per-line': ['warn', { singleline: 3 }],
                'vue/no-empty-pattern': 'error',
                'vue/no-irregular-whitespace': 'error',
                'vue/no-loss-of-precision': 'error',
                'vue/no-restricted-syntax': [
                    'error',
                    'DebuggerStatement',
                    'LabeledStatement',
                    'WithStatement',
                ],
                'vue/no-restricted-v-bind': ['error', '/^v-/'],
                // 'vue/no-setup-props-reactivity-loss': 'off',
                'vue/no-sparse-arrays': 'error',
                'vue/no-unused-refs': 'error',
                'vue/no-useless-v-bind': 'error',
                // 'vue/no-v-html': 'off',
                'vue/no-v-text-v-html-on-component': 'off',
                'vue/object-shorthand': [
                    'error',
                    'always',
                    {
                        avoidQuotes: true,
                        ignoreConstructors: false,
                    },
                ],
                'vue/prefer-separate-static-class': 'error',
                'vue/prefer-template': 'error',
                'vue/prop-name-casing': ['error', 'camelCase'],
                'vue/space-infix-ops': 'error',
                'vue/space-unary-ops': ['error', { nonwords: false, words: true }],

                ...(stylisticEnabled && {
                    'vue/array-bracket-spacing': ['error', 'never'],
                    'vue/arrow-spacing': ['error', { after: true, before: true }],
                    'vue/block-spacing': ['error', 'always'],
                    'vue/block-tag-newline': [
                        'error',
                        {
                            multiline: 'always',
                            singleline: 'always',
                        },
                    ],
                    'vue/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
                    'vue/comma-dangle': ['error', 'always-multiline'],
                    'vue/comma-spacing': ['error', { after: true, before: false }],
                    'vue/comma-style': ['error', 'last'],
                    'vue/html-comment-content-spacing': ['error', 'always', { exceptions: ['-'] }],
                    'vue/html-indent': ['error', indent],
                    'vue/html-quotes': [
                        'error',
                        'double',
                        {
                            avoidEscape: true,
                        },
                    ],
                    'vue/key-spacing': ['error', { afterColon: true, beforeColon: false }],
                    'vue/keyword-spacing': ['error', { after: true, before: true }],
                    'vue/multiline-html-element-content-newline': [
                        'error',
                        {
                            allowEmptyLines: false,
                            ignores: [
                                'NuxtLink',
                                'RouterLink',
                                'ULink',
                                'nuxt-link',
                                'pre',
                                'router-link',
                                'textarea',
                                'u-link',
                                ...inlineElements,
                            ],
                            ignoreWhenEmpty: true,
                        },
                    ],
                    // 'vue/object-curly-newline': 'off',
                    'vue/object-curly-spacing': ['error', 'always'],
                    'vue/object-property-newline': ['error', { allowMultiplePropertiesPerLine: true }],
                    'vue/one-component-per-file': 'off',
                    'vue/operator-linebreak': ['error', 'before'],
                    'vue/padding-line-between-blocks': ['error', 'always'],
                    'vue/quote-props': ['error', 'consistent-as-needed'],
                    'vue/require-default-prop': 'off',
                    'vue/singleline-html-element-content-newline': [
                        'error',
                        {
                            externalIgnores: [],
                            ignores: [
                                'NuxtLink',
                                'RouterLink',
                                'ULink',
                                'nuxt-link',
                                'pre',
                                'router-link',
                                'textarea',
                                'u-link',
                                ...inlineElements,
                            ],
                            ignoreWhenEmpty: true,
                            ignoreWhenNoAttributes: true,
                        },
                    ],
                    'vue/space-in-parens': ['error', 'never'],
                    'vue/template-curly-spacing': 'error',
                }),

                ...(typescript && {
                    // Rules specifically for Vue + TypeScript. See `isTypeAware`-section for type-aware rules

                    'no-undef': 'off',
                    'no-dupe-class-members': 'off',
                    'no-redeclare': 'off',
                    'no-unused-vars': 'off',

                    'no-array-constructor': 'off',
                    '@typescript-eslint/no-array-constructor': 'error',

                    'no-unused-expressions': 'off',
                    '@typescript-eslint/no-unused-expressions': 'error',

                    'no-useless-constructor': 'off',
                    '@typescript-eslint/no-useless-constructor': 'error',

                    'camelcase': 'off',
                    'vue/camelcase': 'off',
                    '@typescript-eslint/naming-convention': [
                        'error',
                        {
                            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                            leadingUnderscore: 'allow',
                            selector: 'variableLike',
                            trailingUnderscore: 'allow',
                        },
                    ],

                    'no-use-before-define': 'off',
                    '@typescript-eslint/no-use-before-define': [
                        'error',
                        {
                            classes: false,
                            enums: false,
                            functions: false,
                            typedefs: false,
                            variables: false,
                        },
                    ],
                }),

                ...overrides,
            },
        },
        ...((isTypeAware
            ? [{
                name: 'moso/vue/rules-type-aware',
                files: filesTypeAware,
                rules: {
                    // Rules merged from @vue/eslint-config-standard-with-typescript

                    // 'dot-notation': 'off',
                    // 'vue/dot-notation': 'off',
                    // '@typescript-eslint/dot-notation': ['error', { allowKeywords: true }],

                    'no-implied-eval': 'off',
                    '@typescript-eslint/no-implied-eval': 'error',

                    'no-unused-vars': 'off',
                    'vue/no-unused-vars': 'off',
                    '@typescript-eslint/no-unused-vars': [
                        'error',
                        {
                            argsIgnorePattern: '^_',
                            args: 'none',
                            caughtErrors: 'none',
                            ignoreRestSiblings: true,
                            vars: 'all',
                        },
                    ],

                    'prefer-promise-reject-errors': 'off',
                    '@typescript-eslint/prefer-promise-reject-errors': 'error',

                    ...overridesTypeAware,
                },
            }]
            : []) satisfies TypedFlatConfigItem[]
        ),
        ...((a11y
            ? [{
                name: 'moso/vue/a11y',
                plugins: {
                    'vue-a11y': memoize(vueA11yPlugin, 'eslint-plugin-vuejs-accessibility'),
                },
                rules: {
                    // eslint-disable-next-line @moso/prefer-reduce-over-chaining
                    ...vueA11yPlugin.configs['flat/recommended']
                        .map((config) => config.rules ?? {})
                        .reduce((acc, rules) => Object.assign(acc, rules), {}),

                    ...overridesA11y,
                },
            }]
            : []) satisfies TypedFlatConfigItem[]
        ),

        ...((isUsingNuxt
            ? [
                {
                    name: 'moso/nuxt/ignores',
                    ignores: [
                        '**/.nuxt',
                        '**/.output',
                        '**/.vercel',
                        '**/.netlify',
                        '**/public',
                    ],
                },
                {
                    name: 'moso/nuxt/rules',
                    files: [
                        // These pages are not used directly by users, so they can have one-worded names
                        `**/pages/**/*.{${GLOB_SRC_EXT},vue}`,
                        `**/layouts/**/*.{${GLOB_SRC_EXT},vue}`,
                        `**/app.{${GLOB_SRC_EXT},vue}`,
                        `**/error.{${GLOB_SRC_EXT},vue}`,

                        // These files shouldn't have multiple words in their names since they are in subdirs
                        `**/components/*/**/*.{${GLOB_SRC_EXT},vue}`,
                    ],
                    rules: {
                        'vue/multi-word-component-names': 'off',
                    },
                },
                {
                    files: [
                        // Pages and layouts are required to have a single root element if transitions are enabled
                        `**/pages/**/*.{${GLOB_SRC_EXT},vue}`,
                        `**/layouts/**/*,{${GLOB_SRC_EXT},vue}`,
                    ],
                    rules: {
                        'vue/no-multiple-template-root': 'error',
                    },
                },
            ]
            : []) satisfies TypedFlatConfigItem[]
        ),
    ];
};
