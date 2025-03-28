import { mergeProcessors } from 'eslint-merge-processors';

import { GLOB_VUE } from '../globs';
import { interopDefault } from '../utils';

import type {
    OptionsFiles,
    OptionsHasTypeScript,
    OptionsOverrides,
    OptionsStylistic,
    OptionsVue,
    TypedFlatConfigItem,
} from '../types';

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
                ...vuePlugin.configs['flat/essential'].map((x: any) => x.rules).reduce((acc: any, x: any) => ({ ...acc, ...x }), {}) as any,
                ...vuePlugin.configs['flat/strongly-recommended'].map((x: any) => x.rules).reduce((acc: any, x: any) => ({ ...acc, ...x }), {}) as any,
                ...vuePlugin.configs['flat/recommended'].map((x: any) => x.rules).reduce((acc: any, x: any) => ({ ...acc, ...x }), {}) as any,

                'node/prefer-global/process': 'off',
                '@typescript-eslint/explicit-function-return-type': 'off',
                'vue/block-order': ['error', {
                    order: ['script', 'template', 'style'],
                }],
                'vue/component-name-in-template-casing': ['error', 'PascalCase'],
                'vue/component-options-name-casing': ['error', 'PascalCase'],

                'vue/custom-event-name-casing': ['error', 'camelCase'],
                'vue/define-macros-order': ['error', {
                    order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'],
                }],
                'vue/dot-location': ['error', 'property'],
                'vue/dot-notation': ['error', { allowKeywords: true }],
                'vue/eqeqeq': ['error', 'smart'],
                'vue/html-indent': ['error', indent],
                'vue/html-quotes': [
                    'error',
                    'double',
                    {
                        avoidEscape: true,
                    },
                ],
                'vue/html-self-closing': 'off',
                'vue/max-attributes-per-line': ['warn', { singleline: 5 }],
                'vue/multi-word-component-names': 'off',
                'vue/no-dupe-keys': 'off',
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
                'vue/no-setup-props-reactivity-loss': 'off',
                'vue/no-sparse-arrays': 'error',
                'vue/no-unused-refs': 'error',
                'vue/no-useless-v-bind': 'error',
                'vue/no-v-html': 'off',
                'vue/no-v-text-v-html-on-component': 'off',
                'vue/object-shorthand': [
                    'error',
                    'always',
                    {
                        avoidQuotes: true,
                        ignoreConstructors: false,
                    },
                ],
                'vue/prefer-import-from-vue': 'off',
                'vue/prefer-separate-static-class': 'error',
                'vue/prefer-template': 'error',
                'vue/prop-name-casing': ['error', 'camelCase'],
                'vue/require-default-prop': 'off',
                'vue/require-prop-types': 'off',
                'vue/space-infix-ops': 'error',
                'vue/space-unary-ops': ['error', { nonwords: false, words: true }],

                ...stylistic
                    ? {
                        'vue/array-bracket-spacing': ['error', 'never'],
                        'vue/arrow-spacing': ['error', { after: true, before: true }],
                        'vue/block-spacing': ['error', 'always'],
                        'vue/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
                        'vue/comma-dangle': ['error', 'always-multiline'],
                        'vue/comma-spacing': ['error', { after: true, before: false }],
                        'vue/comma-style': ['error', 'last'],
                        'vue/html-comment-content-spacing': ['error', 'always', {
                            exceptions: ['-'],
                        }],
                        'vue/key-spacing': ['error', { afterColon: true, beforeColon: false }],
                        'vue/keyword-spacing': ['error', { after: true, before: true }],
                        'vue/object-curly-newline': 'off',
                        'vue/object-curly-spacing': ['error', 'always'],
                        'vue/object-property-newline': ['error', { allowMultiplePropertiesPerLine: true }],
                        'vue/operator-linebreak': ['error', 'before'],
                        'vue/padding-line-between-blocks': ['error', 'always'],
                        'vue/quote-props': ['error', 'consistent-as-needed'],
                        'vue/singleline-html-element-content-newline': 'off',
                        'vue/space-in-parens': ['error', 'never'],
                        'vue/template-curly-spacing': 'error',
                    }
                    : {},

                ...overrides,
            },
        },
    ];
};
