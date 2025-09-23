import { loadPackages, memoize } from '../utils';

import type { ESLint, Linter } from 'eslint';

import type {
    OptionsFiles,
    OptionsOverrides,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

export const toml = async (
    options: Readonly<OptionsOverrides & Required<OptionsFiles & RequiredOptionsStylistic>>,
): Promise<TypedFlatConfigItem[]> => {
    const {
        files,
        overrides,
        stylistic,
    } = options;

    const { indent = 2 } = typeof stylistic === 'boolean' ? {} : stylistic;

    const stylisticEnabled = stylistic !== false;

    const [tomlParser, tomlPlugin] = (await loadPackages([
        'toml-eslint-parser',
        'eslint-plugin-toml',
    ])) as [Linter.Parser, ESLint.Plugin];

    return [
        {
            name: 'moso/toml/setup',
            plugins: {
                toml: memoize(tomlPlugin, 'eslint-plugin-toml'),
            },
        },
        {
            name: 'moso/toml/rules',
            files,
            languageOptions: {
                parser: memoize(tomlParser, 'toml-eslint-parser'),
            },
            rules: {
                '@stylistic/spaced-comment': 'off',

                'toml/comma-style': 'error',
                'toml/keys-order': 'error',
                'toml/no-space-dots': 'error',
                'toml/no-unreadable-number-separator': 'error',
                'toml/precision-of-fractional-seconds': 'error',
                'toml/precision-of-integer': 'error',
                'toml/tables-order': 'error',

                'toml/vue-custom-block/no-parsing-error': 'error',

                ...(stylisticEnabled && {
                    'toml/array-bracket-newline': 'error',
                    'toml/array-bracket-spacing': 'error',
                    'toml/array-element-newline': 'error',
                    'toml/indent': ['error', indent === 'tab' ? 2 : indent],
                    'toml/inline-table-curly-spacing': 'error',
                    'toml/key-spacing': 'error',
                    'toml/padding-line-between-pairs': 'error',
                    'toml/padding-line-between-tables': 'error',
                    'toml/quoted-keys': 'error',
                    'toml/spaced-comment': 'error',
                    'toml/table-bracket-spacing': 'error',
                }),

                ...overrides,
            },
        },
    ];
};
