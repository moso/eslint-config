import { isPackageExists } from 'local-pkg';

import { GLOB_SRC_EXT } from '../globs';
import { loadPackages } from '../tools';
import { flattenRules, memoize, vueInlineElements } from '../utils';

import type {
    OptionsFiles,
    OptionsHasTypeScript,
    OptionsOverrides,
    OptionsTypeScriptParserOptions,
    OptionsTypeScriptWithTypes,
    OptionsVue,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

const NuxtPackages = ['nuxt'];

export const vue = async (
    options: Readonly<
        OptionsOverrides &
        OptionsTypeScriptWithTypes &
        OptionsVue &
        Required<
            OptionsFiles &
            OptionsHasTypeScript &
            OptionsTypeScriptParserOptions &
            RequiredOptionsStylistic
        >
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        a11y,
        files,
        overrides,
        overridesA11y,
        parserOptions,
        stylistic,
        typescript,
    } = options;

    const { braceStyle = '1tbs', indent = 4 } = typeof stylistic === 'boolean' ? {} : stylistic;

    const [
        vuePlugin,
        vueParser,
        processorVueBlocks,
        { mergeProcessors },
    ] = await loadPackages([
        'eslint-plugin-vue',
        'vue-eslint-parser',
        'eslint-processor-vue-blocks',
        'eslint-merge-processors',
    ]);

    const isUsingNuxt = NuxtPackages.some((x) => isPackageExists(x));

    const sfcBlocks = options.sfcBlocks === true ? {} : options.sfcBlocks;

    const stylisticEnabled = stylistic !== false;

    const [typescriptParser] = typescript
        ? await loadPackages(['@typescript-eslint/parser'])
        : [undefined];

    const [vueA11yPlugin] = a11y
        ? await loadPackages(['eslint-plugin-vuejs-accessibility'])
        : [undefined];

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
                ...vueA11yPlugin && { 'vuejs-accessibility': memoize(vueA11yPlugin, 'eslint-plugin-vuejs-accessibility') },
            },
        },
        {
            name: 'moso/vue/rules',
            files,
            languageOptions: {
                parser: memoize(vueParser, 'vue-eslint-parser'),
                parserOptions: {
                    ecmaFeatures: { jsx: true },
                    extraFileExtensions: ['.vue'],
                    parser: typescript ? typescriptParser : null,
                    ...(typescript && parserOptions),
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
                ...flattenRules(vuePlugin.configs['flat/recommended']),

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
                    'vue/brace-style': ['error', braceStyle, { allowSingleLine: true }],
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
                                ...vueInlineElements,
                            ],
                            ignoreWhenEmpty: true,
                        },
                    ],
                    // 'vue/object-curly-newline': 'off',
                    'vue/object-curly-spacing': ['error', 'always'],
                    'vue/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
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
                                ...vueInlineElements,
                            ],
                            ignoreWhenEmpty: true,
                            ignoreWhenNoAttributes: true,
                        },
                    ],
                    'vue/space-in-parens': ['error', 'never'],
                    'vue/template-curly-spacing': 'error',
                }),

                ...(vueA11yPlugin && {
                    ...flattenRules(vueA11yPlugin.configs['flat/recommended']),

                    ...overridesA11y,
                }),

                ...overrides,
            },
        },
        ...((isUsingNuxt
            ? [
                {
                    name: 'moso/nuxt/ignores',
                    ignores: [
                        '**/.netlify',
                        '**/.nuxt',
                        '**/.output',
                        '**/.vercel',
                        '**/public',
                    ],
                },
                {
                    name: 'moso/nuxt/rules',
                    files: [
                        `**/app.{${GLOB_SRC_EXT},vue}`,
                        `**/components/*/**/*.{${GLOB_SRC_EXT},vue}`,
                        `**/error.{${GLOB_SRC_EXT},vue}`,
                        `**/layouts/**/*.{${GLOB_SRC_EXT},vue}`,
                        `**/pages/**/*.{${GLOB_SRC_EXT},vue}`,
                    ],
                    rules: {
                        'vue/multi-word-component-names': 'off',
                    },
                },
                {
                    name: 'moso/nuxt/template-rules',
                    files: [
                        `**/layouts/**/*.{${GLOB_SRC_EXT},vue}`,
                        `**/pages/**/*.{${GLOB_SRC_EXT},vue}`,
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
