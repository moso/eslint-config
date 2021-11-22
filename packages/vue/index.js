module.exports = {
    overrides: [{
        files: ['*.vue'],
        parser: 'vue-eslint-parser',
        parserOptions: {
            parser: '@typescript-eslint/parser'
        }
    }],
    extends: [
        'plugin:vue/vue3-recommended',
        '@moso/eslint-config-ts'
    ],
    rules: {
        'vue/max-attributes-per-line': ['warn', { singleline: 5 }],
        'vue/no-v-html': 'off',
        'vue/require-prop-types': 'off',
        'vue/require-default-prop': 'off'
    }
}
