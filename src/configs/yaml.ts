import { GLOB_YAML } from '@/globs';
import { interopDefault } from '@/utils';

import type { OptionsFiles, OptionsOverrides, OptionsStylistic, TypedFlatConfigItem } from '@/types';

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
                yaml: yamlPlugin,
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

                'yaml/block-mapping': 'error',
                'yaml/block-sequence': 'error',
                'yaml/no-empty-key': 'error',
                'yaml/no-empty-sequence-entry': 'error',
                'yaml/no-irregular-whitespace': 'error',
                'yaml/plain-scalar': 'error',

                'yaml/vue-custom-block/no-parsing-error': 'error',

                ...stylistic
                ? {
                    'yaml/block-mapping-question-indicator-newline': 'error',
                    'yaml/block-sequence-hyphen-indicator-newline': 'error',
                    'yaml/flow-mapping-curly-newline': 'error',
                    'yaml/flow-mapping-curly-spacing': 'error',
                    'yaml/flow-sequence-bracket-newline': 'error',
                    'yaml/flow-sequence-bracket-spacing': 'error',
                    'yaml/indent': ['error', indent === 'tab' ? 2 : indent],
                    'yaml/key-spacing': 'error',
                    'yaml/no-tab-indent': 'error',
                    'yaml/quotes': ['error', { avoidEscape: false, prefer: quotes }],
                    'yaml/spaced-comment': 'error',
                }
                : {},

                ...overrides,
            },
        },
    ];
};
