import { mergeProcessors } from 'eslint-merge-processors';

import { GLOB_VUE } from '@/globs';
import { interopDefault } from '@/utils';

import type { OptionsFiles, OptionsHasTypeScript, OptionsOverrides, OptionsStylistic, OptionsVue, TypedFlatConfigItem } from '@/types';

export const vue = async (options:
    OptionsVue &
    OptionsHasTypeScript &
    OptionsOverrides &
    OptionsStylistic &
    OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> => {
    const {
        files = [GLOB_VUE],
        overrides = {},
        stylistic = true,
        vueVersion = 3,
    } = options;

    const sfcBlocks = options.sfcBlocks === true
        ? {}
        : options.sfcBlocks ?? {};

    const { indent = 4 } = typeof stylistic === 'boolean' ? {} : stylistic;

    const [
        vuePlugin,
        vueParser,
        processorVueBlocks,
    ] = await Promise.all([
        interopDefault(import('eslint-plugin-vue')),
        interopDefault(import('vue-eslint-parser')),
        interopDefault(import('eslint-processor-vue-blocks')),
    ] as const);

    return [
        {
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
            name: 'moso/vue/setup',
            plugins: {
                vue: vuePlugin,
            },
        },
        {
            files,
            languageOptions: {
                parser: vueParser,
                parserOptions: {
                    ecmaFeatures: {
                        jsx: true,
                    },
                    extraFileExtensions: ['.vue'],
                    parser: options.typescript
                        ? await interopDefault(import('@typescript-eslint/parser')) as any
                        : null,
                    sourceType: 'module',
                },
            },
            name: 'moso/vue/rules',
            processor: sfcBlocks === false
                ? vuePlugin.processors['.vue']
                : mergeProcessors([
                    vuePlugin.processors['.vue'],
                    processorVueBlocks({
                        ...sfcBlocks,
                        blocks: {
                            styles: true,
                        ...sfcBlocks.blocks,
                        },
                    }),
                ]),
            rules: {
                ...vuePlugin.configs.base.rules as any,

                ...vueVersion === 2
                ? {
                    ...vuePlugin.configs.essential.rules as any,
                    ...vuePlugin.configs['strongly-recommended'].rules as any,
                    ...vuePlugin.configs.recommended.rules as any,
                }
                : {
                    ...vuePlugin.configs['vue3-essential'].rules as any,
                    ...vuePlugin.configs['vue3-strongly-recommended'].rules as any,
                    ...vuePlugin.configs['vue3-recommended'].rules as any,
                },

                'node/prefer-global/process': 0,
                'vue/block-order': ['error', {
                    order: ['script', 'template', 'style'],
                }],
                'vue/component-name-in-template-casing': ['error', 'PascalCase'],
                'vue/component-options-name-casing': ['error', 'PascalCase'],
                // this is deprecated

                'vue/custom-event-name-casing': ['error', 'camelCase'],
                'vue/define-macros-order': ['error', {
                    order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'],
                }],
                'vue/dot-location': ['error', 'property'],
                'vue/dot-notation': ['error', { allowKeywords: true }],
                'vue/eqeqeq': ['error', 'smart'],
                'vue/html-indent': ['error', 4],
                'vue/html-quotes': ['error', 'double'],
                'vue/html-self-closing': 0,
                'vue/max-attributes-per-line': ['warn', { 'singleline': 5 }],
                'vue/multi-word-component-names': 0,
                'vue/no-dupe-keys': 0,
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
                'vue/no-setup-props-destructure': 0,
                'vue/no-setup-props-reactivity-loss': 0,
                'vue/no-sparse-arrays': 'error',
                'vue/no-unused-refs': 'error',
                'vue/no-useless-v-bind': 'error',
                'vue/no-v-html': 0,
                'vue/no-v-text-v-html-on-component': 0,
                'vue/object-shorthand': [
                    'error',
                    'always',
                    {
                        avoidQuotes: true,
                        ignoreConstructors: false,
                    },
                ],
                'vue/prefer-import-from-vue': 0,
                'vue/prefer-separate-static-class': 'error',
                'vue/prefer-template': 'error',
                'vue/prop-name-casing': ['error', 'camelCase'],
                'vue/require-default-prop': 0,
                'vue/require-prop-types': 0,
                'vue/space-infix-ops': 'error',
                'vue/space-unary-ops': ['error', { nonwords: false, words: true }],

                ...stylistic
                ? {
                    'vue/array-bracket-spacing': ['error', 'never'],
                    'vue/arrow-spacing': ['error', { after: true, before: true }],
                    'vue/block-spacing': ['error', 'always'],
                    'vue/block-tag-newline': ['error', {
                        multiline: 'always',
                        singleline: 'always',
                    }],
                    'vue/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
                    'vue/comma-dangle': ['error', 'always-multiline'],
                    'vue/comma-spacing': ['error', { after: true, before: false }],
                    'vue/comma-style': ['error', 'last'],
                    'vue/component-tags-order': ['error', {
                        order: ['script', 'template', 'style'],
                    }],
                    'vue/html-comment-content-spacing': ['error', 'always', {
                        exceptions: ['-'],
                    }],
                    'vue/key-spacing': ['error', { afterColon: true, beforeColon: false }],
                    'vue/keyword-spacing': ['error', { after: true, before: true }],
                    'vue/object-curly-newline': 0,
                    'vue/object-curly-spacing': ['error', 'always'],
                    'vue/object-property-newline': ['error', { allowMultiplePropertiesPerLine: true }],
                    'vue/operator-linebreak': ['error', 'before'],
                    'vue/padding-line-between-blocks': ['error', 'always'],
                    'vue/quote-props': ['error', 'consistent-as-needed'],
                    'vue/singleline-html-element-content-newline': 0,
                    'vue/space-in-parens': ['error', 'never'],
                    'vue/template-curly-spacing': 'error',
                }
                : {},

                ...overrides,
            },
        },
    ];
};
