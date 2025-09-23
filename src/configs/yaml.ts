import { loadPackages, memoize } from '../utils';

import type { ESLint, Linter } from 'eslint';

import type {
    OptionsFiles,
    OptionsOverrides,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

export const yaml = async (
    options: Readonly<OptionsOverrides & Required<OptionsFiles & RequiredOptionsStylistic>>,
): Promise<TypedFlatConfigItem[]> => {
    const {
        files,
        overrides,
        stylistic,
    } = options;

    const { quotes = 'single' } = typeof stylistic === 'boolean' ? {} : stylistic;

    const stylisticEnabled = stylistic === false ? 'off' : 'error';

    const [yamlPlugin, yamlParser] = (await loadPackages([
        'eslint-plugin-yml',
        'yaml-eslint-parser',
    ])) as [ESLint.Plugin, Linter.Parser];

    return [
        {
            name: 'moso/yaml/setup',
            plugins: {
                'yml': memoize(yamlPlugin, 'eslint-plugin-yml'),
            },
        },
        {
            files,
            languageOptions: {
                parser: memoize(yamlParser, 'yaml-eslint-parser'),
            },
            name: 'moso/yaml/rules',
            rules: {
                '@stylistic/spaced-comment': 'off',

                'yml/block-mapping': 'error',
                'yml/block-sequence': 'error',
                'yml/no-empty-key': 'error',
                'yml/no-empty-sequence-entry': 'error',
                'yml/no-irregular-whitespace': 'error',
                'yml/plain-scalar': 'error',

                'yml/vue-custom-block/no-parsing-error': 'error',

                'yml/block-mapping-question-indicator-newline': stylisticEnabled,
                'yml/block-sequence-hyphen-indicator-newline': stylisticEnabled,
                'yml/flow-mapping-curly-newline': stylisticEnabled,
                'yml/flow-mapping-curly-spacing': stylisticEnabled,
                'yml/flow-sequence-bracket-newline': stylisticEnabled,
                'yml/flow-sequence-bracket-spacing': stylisticEnabled,
                'yml/indent': [stylisticEnabled, 2],
                'yml/key-spacing': stylisticEnabled,
                'yml/no-tab-indent': stylisticEnabled,
                'yml/quotes': [stylisticEnabled, { avoidEscape: true, prefer: quotes === 'backtick' ? 'single' : quotes }],
                'yml/spaced-comment': stylisticEnabled,

                ...overrides,
            },
        },
    ];
};
