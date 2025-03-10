import { GLOB_YAML } from '../globs';
import { interopDefault } from '../utils';

import type {
    OptionsFiles,
    OptionsOverrides,
    OptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

export const yaml = async (options: OptionsOverrides & OptionsStylistic & OptionsFiles = {}): Promise<TypedFlatConfigItem[]> => {
    const {
        files = [GLOB_YAML],
        overrides = {},
        stylistic = true,
    } = options;

    const {
        indent = 2,
        quotes = 'single',
    } = typeof stylistic === 'boolean' ? {} : stylistic;

    const [
        yamlPlugin,
        yamlParser,
    ] = await Promise.all([
        interopDefault(import('eslint-plugin-yml')),
        interopDefault(import('yaml-eslint-parser')),
    ] as const);

    return [
        {
            name: 'moso/yaml/setup',
            plugins: {
                yml: yamlPlugin,
            },
        },
        {
            files,
            languageOptions: {
                parser: yamlParser,
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

                ...stylistic
                    ? {
                        'yml/block-mapping-question-indicator-newline': 'error',
                        'yml/block-sequence-hyphen-indicator-newline': 'error',
                        'yml/flow-mapping-curly-newline': 'error',
                        'yml/flow-mapping-curly-spacing': 'error',
                        'yml/flow-sequence-bracket-newline': 'error',
                        'yml/flow-sequence-bracket-spacing': 'error',
                        'yml/indent': ['error', indent === 'tab' ? 2 : indent],
                        'yml/key-spacing': 'error',
                        'yml/no-tab-indent': 'error',
                        'yml/quotes': ['error', { avoidEscape: true, prefer: quotes === 'backtick' ? 'single' : quotes }],
                        'yml/spaced-comment': 'error',
                    }
                    : {},

                ...overrides,
            },
        },
    ];
};
