module.exports = {
    overrides: [{
        files: ['*.vue'],
        parser: 'vue-eslint-parser',
        parserOptions: {
            parser: '@typescript-eslint/parser',
        },
    }],
    extends: [
        'plugin:vue/vue3-recommended',
        '@moso/eslint-config-ts',
    ],
    rules: {
        'vue/html-indent': ['error', 4],
        'vue/max-attributes-per-line': ['warn', { singleline: 5 }],
        'vue/multi-word-component-names': 'off',
        'vue/no-dupe-keys': 'off',
        'vue/no-v-text-v-html-on-component': 'off',
        'vue/prefer-import-from-vue': 'off',
        'vue/require-prop-types': 'off',
        'vue/require-default-prop': 'off',
        'vue/singleline-html-element-content-newline': 'off',

        // Reactivity transform
        'vue/no-setup-props-destructure': 'off',

        // Opinionated
        'vue/component-tags-order': ['error', {
            order: ['script', 'template', 'style'],
        }],
        'vue/no-restricted-v-bind': ['error', '/^v-/'],
        'vue/no-useless-v-bind': 'error',
        'vue/no-unused-refs': 'error',
        'vue/padding-line-between-blocks': ['error', 'always'],

        // Extensions
        'vue/comma-dangle': ['error', 'always-multiline'],
        'vue/comma-spacing': ['error', { before: false, after: true }],
        'vue/dot-location': ['error', 'property'],
        'vue/dot-notation': ['error', { allowKeywords: true }],
        'vue/eqeqeq': ['error', 'smart'],
        'vue/prefer-template': 'error',
        'vue/quote-props': ['error', 'consistent-as-needed'],
    },
}
