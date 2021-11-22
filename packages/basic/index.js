module.exports = {
    env: {
        es6: true,
        browser: true,
        node: true
    },
    extends: [
        'plugin:import/errors',
        'plugin:import/warnings'
    ],
    plugins: ['html', 'unicorn'],
    settings: {
        'import/resolver': {
            node: { extensions: ['.js', '.mjs', '.ts', '.d.ts'] }
        }
    },
    rules: {
        // import
        'import/first': 'error',
        'import/order': 'error',
        'import/no-absolute-path': ['error', { esmodule: true, commonjs: true }],
        'import/no-mutable-exports': 'error',
        'import/no-named-as-default': 0,

        // Common
        'array-bracket-spacing': ['error', 'never'],
        'block-spacing': ['error', 'always'],
        'brace-style': ['error', '1tbs', { allowSingleLine: true }],
        camelcase: 'off',
        'comma-dangle': ['error', 'never'],
        'comma-spacing': ['error', { before: false, after: true }],
        'comma-style': ['error', 'last'],
        curly: ['error', 'multi-or-nest', 'consistent'],
        'func-call-spacing': ['error', 'never'],
        indent: ['error', 4, { SwitchCase: 1, VariableDeclarator: 1, outerIIFEBody: 1 }],
        'key-spacing': ['error', { beforeColon: false, afterColon: true }],
        'no-cond-assign': ['error', 'always'],
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'no-constant-condition': 'warn',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-mixed-spaces-and-tabs': 'error',
        'no-param-reassign': 'off',
        'no-restricted-syntax': ['error', 'DebuggerStatement', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
        'no-return-await': 'off',
        'no-unused-vars': 'warn',
        'no-use-before-define': ['error', { functions: false, classes: false, variables: true }],
        'object-curly-spacing': ['error', 'always'],
        quotes: ['error', 'single', { allowTemplateLiterals: true }],
        semi: [2, 'never'],
        'space-before-function-paren': ['error', { anonymous: 'never', named: 'never', asyncArrow: 'always' }],

        // es6
        'arrow-parens': ['error', 'always'],
        'generator-star-spacing': 'off',
        'no-var': 'error',
        'object-shorthand': ['error', 'always', { ignoreConstructors: false, avoidQuotes: true }],
        'prefer-arrow-callback': ['error', { allowNamedFunctions: false, allowUnboundThis: true }],
        'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: true }],
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-template': 'error',
        'template-curly-spacing': ['error', 'always'],

        // best-practice
        'block-scoped-var': 'error',
        complexity: ['off', 11],
        'consistent-return': 'off',
        eqeqeq: ['error', 'smart'],
        'no-alert': 'warn',
        'no-case-declarations': 'error',
        'no-multi-spaces': 'error',
        'no-multi-str': 'error',
        'no-redeclare': ['error', { builtinGlobals: true }],
        'no-return-assign': 'off',
        'no-with': 'error',
        'no-void': 'error',
        'no-useless-escape': 'error',
        'no-useless-rename': 'error',
        'operator-linebreak': [2, 'before'],
        'vars-on-top': 'error',
        'require-await': 'error',

        // unicorns
        // Pass error message when throwing errors
        'unicorn/error-message': 'error',
        // Uppercase regex escapes
        'unicorn/escape-case': 'error',
        // Array.isArray instead of instanceof
        'unicorn/no-array-instanceof': 'error',
        // Prevent deprecated `new Buffer()`
        'unicorn/no-new-buffer': 'error',
        // Keep regex literals safe!
        'unicorn/no-unsafe-regex': 'off',
        // Lowercase number formatting for octal, hex, binary (0x12 instead of 0X12)
        'unicorn/number-literal-case': 'error',
        // ** instead of Math.pow()
        'unicorn/prefer-exponentiation-operator': 'error',
        // includes over indexOf when checking for existence
        'unicorn/prefer-includes': 'error',
        // String methods startsWith/endsWith instead of more complicated stuff
        'unicorn/prefer-starts-ends-with': 'error',
        // textContent instead of innerText
        'unicorn/prefer-text-content': 'error',
        // Enforce throwing type error when throwing error while checking typeof
        'unicorn/prefer-type-error': 'error',
        // Use new when throwing error
        'unicorn/throw-new-error': 'error'
    }
}
