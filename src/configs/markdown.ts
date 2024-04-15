import { mergeProcessors, processorPassThrough } from 'eslint-merge-processors';

import { GLOB_MARKDOWN, GLOB_MARKDOWN_CODE, GLOB_MARKDOWN_IN_MARKDOWN } from '@/globs';
import { interopDefault, parserPlain } from '@/utils';

import type { OptionsComponentExts, OptionsFiles, OptionsOverrides, TypedFlatConfigItem } from '@/types';

export const markdown = async (options: OptionsFiles & OptionsComponentExts & OptionsOverrides = {}): Promise<TypedFlatConfigItem[]> => {
    const {
        componentExts = [],
        files = [GLOB_MARKDOWN],
        overrides = {},
    } = options;

    const markdown = await interopDefault(import('eslint-plugin-markdown'));

    return [
        {
            name: 'moso/markdown/setup',
            plugins: {
                markdown,
            },
        },
        {
            files,
            ignores: [GLOB_MARKDOWN_IN_MARKDOWN],
            name: 'moso/markdown/processor',
            // `eslint-plugin-markdown` only creates virtual files for code blocks,
            // but not the markdown file itself. We use `eslint-merge-processors` to
            // add a pass-through processor for the markdown file itself.
            processor: mergeProcessors([
                markdown.processors.markdown,
                processorPassThrough,
            ]),
        },
        {
            files,
            languageOptions: {
                parser: parserPlain,
            },
            name: 'moso/markdown/parser',
        },
        {
            files: [
                GLOB_MARKDOWN_CODE,
                ...componentExts.map(ext => `${GLOB_MARKDOWN}/**/*.${ext}`),
            ],
            languageOptions: {
                parserOptions: {
                    ecmaFeatures: {
                        impliedStrict: true,
                    },
                },
            },
            name: 'moso/markdown/rules',
            rules: {
                'import/newline-after-import': 0,

                'no-alert': 0,
                'no-console': 0,
                'no-labels': 0,
                'no-lone-blocks': 0,
                'no-restricted-syntax': 0,
                'no-undef': 0,
                'no-unused-expressions': 0,
                'no-unused-labels': 0,
                'no-unused-vars': 0,

                'node/prefer-global/process': 0,

                '@stylistic/comma-dangle': 0,
                '@stylistic/consistent-type-imports': 0,
                '@stylistic/eol-last': 0,
                '@stylistic/no-namespace': 0,
                '@stylistic/no-redeclare': 0,
                '@stylistic/no-require-imports': 0,
                '@stylistic/no-unused-vars': 0,
                '@stylistic/no-use-before-define': 0,
                '@stylistic/no-var-requires': 0,

                'unicode-bom': 0,
                'unused-imports/no-unused-imports': 0,
                'unused-imports/no-unused-vars': 0,

                // Type aware rules
                ...{
                    '@stylistic/await-thenable': 0,
                    '@stylistic/dot-notation': 0,
                    '@stylistic/no-floating-promises': 0,
                    '@stylistic/no-for-in-array': 0,
                    '@stylistic/no-implied-eval': 0,
                    '@stylistic/no-misused-promises': 0,
                    '@stylistic/no-throw-literal': 0,
                    '@stylistic/no-unnecessary-type-assertion': 0,
                    '@stylistic/no-unsafe-argument': 0,
                    '@stylistic/no-unsafe-assignment': 0,
                    '@stylistic/no-unsafe-call': 0,
                    '@stylistic/no-unsafe-member-access': 0,
                    '@stylistic/no-unsafe-return': 0,
                    '@stylistic/restrict-plus-operands': 0,
                    '@stylistic/restrict-template-expressions': 0,
                    '@stylistic/unbound-method': 0,
                },
                ...overrides,
            },
        },
    ]
}
