module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    parserOptions: {
        parser: 'babel-eslint'
    },
    extends: [
        '@moso/eslint-config-basic',
        'plugin:vue/vue-essential'
    ],
    plugins: [
        'vue'
    ],
    rules: {
        'vue/max-attributes-per-line': ['warn', { singleline: 5 }]
    }
}
