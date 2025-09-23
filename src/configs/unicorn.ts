import { loadPackages, memoize } from '../utils';

import type {
    OptionsFunctional,
    OptionsLessOpinionated,
    OptionsOverrides,
    TypedFlatConfigItem,
} from '../types';

export const unicorn = async (
    options: Readonly<
        OptionsFunctional &
        OptionsLessOpinionated &
        OptionsOverrides
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        functionalEnforcement,
        lessOpinionated,
        overrides,
    } = options;

    const [unicornPlugin] = (await loadPackages(['eslint-plugin-unicorn'])) as [(typeof import('eslint-plugin-unicorn'))['default']];

    const functionalEnabled = functionalEnforcement === 'none' ? 'error' : 'off';

    return [
        {
            name: 'moso/unicorn',
            plugins: {
                'unicorn': memoize(unicornPlugin, 'eslint-plugin-unicorn'),
            },
            rules: {
                'unicorn/catch-error-name': 'error',
                'unicorn/consistent-empty-array-spread': 'error',
                'unicorn/error-message': 'error',
                'unicorn/escape-case': 'error',
                'unicorn/new-for-builtins': lessOpinionated ? 'error' : 'off',
                'unicorn/no-instanceof-builtins': ['error', { strategy: 'strict', useErrorIsError: true }],
                'unicorn/no-invalid-fetch-options': 'error',
                'unicorn/no-negation-in-equality-check': 'error',
                'unicorn/no-new-array': lessOpinionated ? 'off' : 'error',
                'unicorn/no-new-buffer': lessOpinionated ? 'off' : 'error',
                'unicorn/number-literal-case': 'error',
                'unicorn/prefer-dom-node-text-content': 'error',
                'unicorn/prefer-includes': 'error',
                'unicorn/prefer-node-protocol': 'error',
                'unicorn/prefer-number-properties': 'error',
                'unicorn/prefer-string-starts-ends-with': 'error',
                'unicorn/prefer-type-error': 'error',
                'unicorn/throw-new-error': 'error',

                ...(!lessOpinionated && {
                    'unicorn/better-regex': 'error',
                    'unicorn/consistent-function-scoping': 'error',
                    'unicorn/custom-error-definition': 'error',
                    'unicorn/no-anonymous-default-export': 'error',
                    'unicorn/no-array-for-each': 'error',
                    'unicorn/no-array-method-this-argument': 'error',
                    'unicorn/no-await-expression-member': 'error',
                    'unicorn/no-await-in-promise-methods': 'error',
                    'unicorn/no-console-spaces': 'error',
                    'unicorn/no-document-cookie': 'error',
                    'unicorn/no-for-loop': 'error',
                    'unicorn/no-hex-escape': 'error',
                    'unicorn/no-invalid-remove-event-listener': 'error',
                    'unicorn/no-negated-condition': 'error',
                    'unicorn/no-object-as-default-parameter': 'error',
                    'unicorn/no-single-promise-in-promise-methods': 'error',
                    'unicorn/no-static-only-class': 'error',
                    'unicorn/no-thenable': 'error',
                    'unicorn/no-this-assignment': 'error',
                    'unicorn/no-typeof-undefined': 'error',
                    'unicorn/no-unnecessary-array-flat-depth': 'error',
                    'unicorn/no-unnecessary-await': 'error',
                    'unicorn/no-unnecessary-polyfills': 'error',
                    'unicorn/no-unreadable-array-destructuring': 'error',
                    'unicorn/no-unreadable-iife': 'error',
                    'unicorn/no-useless-fallback-in-spread': 'error',
                    'unicorn/no-useless-length-check': 'error',
                    'unicorn/no-useless-promise-resolve-reject': 'error',
                    'unicorn/no-useless-spread': functionalEnabled,
                    'unicorn/no-useless-switch-case': 'error',
                    'unicorn/no-zero-fractions': 'error',
                    'unicorn/numeric-separators-style': 'error',
                    'unicorn/prefer-add-event-listener': 'error',
                    'unicorn/prefer-array-find': 'error',
                    'unicorn/prefer-array-flat': 'error',
                    'unicorn/prefer-array-index-of': 'error',
                    'unicorn/prefer-array-some': 'error',
                    'unicorn/prefer-at': ['error', { checkAllIndexAccess: false }],
                    'unicorn/prefer-blob-reading-methods': 'error',
                    'unicorn/prefer-date-now': 'error',
                    'unicorn/prefer-default-parameters': 'error',
                    'unicorn/prefer-dom-node-append': 'error',
                    'unicorn/prefer-dom-node-dataset': 'error',
                    'unicorn/prefer-dom-node-remove': 'error',
                    'unicorn/prefer-event-target': 'error',
                    'unicorn/prefer-export-from': 'error',
                    'unicorn/prefer-import-meta-properties': 'error',
                    'unicorn/prefer-keyboard-event-key': 'error',
                    'unicorn/prefer-logical-operator-over-ternary': 'error',
                    'unicorn/prefer-modern-dom-apis': 'error',
                    'unicorn/prefer-modern-math-apis': 'error',
                    'unicorn/prefer-module': 'error',
                    'unicorn/prefer-native-coercion-functions': 'error',
                    'unicorn/prefer-object-from-entries': 'error',
                    'unicorn/prefer-optional-catch-binding': 'error',
                    'unicorn/prefer-query-selector': 'error',
                    'unicorn/prefer-reflect-apply': 'error',
                    'unicorn/prefer-regexp-test': 'error',
                    'unicorn/prefer-single-call': 'error',
                    'unicorn/prefer-spread': 'error',
                    'unicorn/prefer-string-replace-all': 'error',
                    'unicorn/prefer-string-slice': 'error',
                    'unicorn/prefer-switch': 'error',
                    'unicorn/prefer-ternary': 'error',
                    'unicorn/prefer-top-level-await': 'off', // Clashes with @moso/no-top-level-await
                    'unicorn/require-array-join-separator': 'error',
                    'unicorn/require-number-to-fixed-digits-argument': 'error',
                    'unicorn/switch-case-braces': 'error',
                }),

                ...overrides,
            },
        },
    ];
};
