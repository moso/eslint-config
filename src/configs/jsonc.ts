import { loadPackages, memoize } from '../utils';

import type { ESLint, Linter } from 'eslint';

import type {
    OptionsFiles,
    OptionsOverrides,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

export const jsonc = async (
    options: Readonly<OptionsOverrides & Required<OptionsFiles & RequiredOptionsStylistic>>,
): Promise<TypedFlatConfigItem[]> => {
    const {
        files,
        overrides,
        stylistic,
    } = options;

    const { indent = 4 } = typeof stylistic === 'boolean' ? {} : stylistic;

    const [jsoncPlugin, jsoncParser] = (await loadPackages([
        'eslint-plugin-jsonc',
        'jsonc-eslint-parser',
    ])) as [ESLint.Plugin, Linter.Parser];

    const stylisticEnabled = stylistic === false ? 'off' : 'error';

    return [
        {
            name: 'moso/jsonc',
            files,
            plugins: {
                'jsonc': memoize(jsoncPlugin, 'eslint-plugin-jsonc'),
            },
            languageOptions: {
                parser: memoize(jsoncParser, 'jsonc-eslint-parser'),
            },
            rules: {
                'jsonc/no-bigint-literals': 'error',
                'jsonc/no-binary-expression': 'error',
                'jsonc/no-binary-numeric-literals': 'error',
                'jsonc/no-dupe-keys': 'error',
                'jsonc/no-escape-sequence-in-identifier': 'error',
                'jsonc/no-floating-decimal': 'error',
                'jsonc/no-hexadecimal-numeric-literals': 'error',
                'jsonc/no-infinity': 'error',
                'jsonc/no-multi-str': 'error',
                'jsonc/no-nan': 'error',
                'jsonc/no-number-props': 'error',
                'jsonc/no-numeric-separators': 'error',
                'jsonc/no-octal': 'error',
                'jsonc/no-octal-escape': 'error',
                'jsonc/no-octal-numeric-literals': 'error',
                'jsonc/no-parenthesized': 'error',
                'jsonc/no-plus-sign': 'error',
                'jsonc/no-regexp-literals': 'error',
                'jsonc/no-sparse-arrays': 'error',
                'jsonc/no-template-literals': 'error',
                'jsonc/no-undefined-value': 'error',
                'jsonc/no-unicode-codepoint-escapes': 'error',
                'jsonc/no-useless-escape': 'error',
                'jsonc/space-unary-ops': 'error',
                'jsonc/valid-json-number': 'error',
                'jsonc/vue-custom-block/no-parsing-error': 'error',

                'jsonc/array-bracket-spacing': [stylisticEnabled, 'never'],
                'jsonc/comma-dangle': [stylisticEnabled, 'never'],
                'jsonc/comma-style': [stylisticEnabled, 'last'],
                'jsonc/indent': [stylisticEnabled, indent],
                'jsonc/key-spacing': [stylisticEnabled, { afterColon: true, beforeColon: false }],
                'jsonc/object-curly-newline': [stylisticEnabled, { consistent: true, multiline: true }],
                'jsonc/object-curly-spacing': [stylisticEnabled, 'always'],
                'jsonc/object-property-newline': [stylisticEnabled, { allowMultiplePropertiesPerLine: true }],
                'jsonc/quote-props': stylisticEnabled,
                'jsonc/quotes': stylisticEnabled,

                ...overrides,
            },
        },
    ];
};
