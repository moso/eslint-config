module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    parserOptions: {
        parser: 'babel-eslint',
    },
    extends: [
        '@moso/eslint-config-basic',
        '@nuxtjs',
        'plugin:nuxt/recommended',
        'plugin:vue/essential'
    ],
    plugins: [
        'vue',
    ],
    rules: {
        //
    },
}
