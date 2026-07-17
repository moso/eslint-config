import assert from 'node:assert/strict';

import { GLOB_ASTRO, GLOB_SRC, GLOB_VUE } from '../globs';
import { loadPackages, memoize } from '../utils';

import type {
    OptionsLessOpinionated,
    OptionsOverrides,
    TypedFlatConfigItem,
} from '../types';

export const unicorn = async (
    options: Readonly<OptionsLessOpinionated & OptionsOverrides>,
): Promise<TypedFlatConfigItem[]> => {
    const { lessOpinionated, overrides } = options;

    const [unicornPlugin] = (await loadPackages(['eslint-plugin-unicorn'])) as [(typeof import('eslint-plugin-unicorn'))['default']];

    return [
        {
            name: 'moso/unicorn',
            files: [GLOB_SRC, GLOB_ASTRO, GLOB_VUE],
            plugins: {
                'unicorn': memoize(unicornPlugin, 'eslint-plugin-unicorn'),
            },
            rules: {
                    // Unopinionated rules for everyone
                    ...(assert.ok(!Array.isArray(unicornPlugin.configs.unopinionated)),
                    unicornPlugin.configs.unopinionated.rules),

                    ...(!lessOpinionated && {
                        // Recommended rules
                        ...(assert.ok(!Array.isArray(unicornPlugin.configs.recommended)),
                        unicornPlugin.configs.recommended.rules),

                        // Opinionated additions
                        'unicorn/custom-error-definition': 'error',
                        'unicorn/no-instanceof-builtins': ['error', { strategy: 'strict', useErrorIsError: true }],
                        'unicorn/no-unsafe-dom-html': 'error',
                        'unicorn/prefer-at': ['error', { checkAllIndexAccess: false }],
                        'unicorn/prefer-short-arrow-method': 'error',
                        // 'unicorn/prefer-temporal': 'error', // Too soon, will be enabled in the future
                        'unicorn/try-complexity': 'error',

                        // Opinionated disables
                        'unicorn/consistent-boolean-name': 'off',
                        'unicorn/consistent-compound-words': 'off',
                        'unicorn/consistent-export-decorator-position': 'off',
                        'unicorn/default-export-style': 'off',
                        'unicorn/empty-brace-spaces': 'off',
                        'unicorn/expiring-todo-comments': 'off',
                        'unicorn/explicit-length-check': 'off',
                        'unicorn/explicit-timer-delay': 'off',
                        'unicorn/filename-case': 'off',
                        'unicorn/import-style': 'off',
                        'unicorn/isolated-functions': 'off',
                        'unicorn/logical-assignment-operators': 'off',
                        'unicorn/max-nested-calls': 'off',
                        'unicorn/name-replacements': 'off',
                        'unicorn/no-array-concat-in-loop': 'off',
                        'unicorn/no-array-fill-with-reference-type': 'off',
                        'unicorn/no-array-reduce': 'off', // Clashes with @moso/prefer-reduce-over-chaining
                        'unicorn/no-array-sort': 'off',
                        'unicorn/no-array-sort-for-min-max': 'off',
                        'unicorn/no-array-splice': 'off',
                        'unicorn/no-async-promise-finally': 'off',
                        'unicorn/no-break-in-nested-loop': 'off',
                        'unicorn/no-chained-comparison': 'off',
                        'unicorn/no-empty-file': 'off',
                        'unicorn/no-error-property-assignment': 'off',
                        'unicorn/no-exports-in-scripts': 'off',
                        'unicorn/no-for-each': 'off',
                        'unicorn/no-invalid-well-known-symbol-methods': 'off',
                        'unicorn/no-late-current-target-access': 'off',
                        'unicorn/no-late-event-control': 'off',
                        'unicorn/no-lonely-if': 'off',
                        'unicorn/no-mismatched-map-key': 'off',
                        'unicorn/no-named-default': 'off',
                        'unicorn/no-nested-ternary': 'off',
                        'unicorn/no-non-function-verb-prefix': 'off',
                        'unicorn/no-nonstandard-builtin-properties': 'off',
                        'unicorn/no-null': 'off',
                        'unicorn/no-process-exit': 'off',
                        'unicorn/no-shorthand-property-overrides': 'off', // Transpiling with LightningCSS can trigger false positivies
                        'unicorn/no-unnecessary-array-flat-map': 'off', // Clashes with @moso/no-unnecessary-array-flat-map
                        'unicorn/no-unsafe-string-replacement': 'off',
                        'unicorn/no-useless-boolean-cast': 'off',
                        'unicorn/no-useless-else': 'off',
                        'unicorn/no-useless-iterator-to-array': 'off',
                        'unicorn/no-useless-undefined': 'off',
                        'unicorn/operator-assignment': 'off',
                        'unicorn/prefer-array-from-async': 'off',
                        'unicorn/prefer-array-slice': 'off',
                        'unicorn/prefer-dispose': 'off',
                        'unicorn/prefer-dom-node-remove': 'off',
                        'unicorn/prefer-early-return': 'off', // Clashes with @moso/prefer-early-return
                        'unicorn/prefer-flat-math-min-max': 'off',
                        'unicorn/prefer-get-or-insert-computed': 'off',
                        'unicorn/prefer-global-number-constants': 'off',
                        'unicorn/prefer-global-this': 'off',
                        'unicorn/prefer-https': 'off',
                        'unicorn/prefer-identifier-import-export-specifiers': 'off',
                        'unicorn/prefer-location-assign': 'off',
                        'unicorn/prefer-map-from-entries': 'off',
                        'unicorn/prefer-negative-index': 'off',
                        'unicorn/prefer-number-is-safe-integer': 'off',
                        'unicorn/prefer-promise-try': 'off',
                        'unicorn/prefer-promise-with-resolvers': 'off',
                        'unicorn/prefer-prototype-methods': 'off',
                        'unicorn/prefer-single-replace': 'off',
                        'unicorn/prefer-split-limit': 'off',
                        'unicorn/prefer-string-raw': 'off',
                        'unicorn/prefer-string-repeat': 'off',
                        'unicorn/prefer-toggle-attribute': 'off',
                        'unicorn/prefer-top-level-await': 'off', // Clashes with @moso/no-top-level-await
                        'unicorn/prefer-type-literal-last': 'off',
                        'unicorn/prefer-while-loop-condition': 'off', // Oh hell nah
                        'unicorn/relative-url-style': 'off',
                        'unicorn/require-array-sort-compare': 'off',
                        'unicorn/require-css-escape': 'off',
                        'unicorn/require-module-attributes': 'off',
                        'unicorn/require-module-specifiers': 'off',
                    }
                ),

                ...overrides,
            },
        },
    ];
};
