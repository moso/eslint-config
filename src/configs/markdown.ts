import { mergeProcessors, processorPassThrough } from 'eslint-merge-processors';

import { GLOB_MARKDOWN, GLOB_MARKDOWN_CODE, GLOB_MARKDOWN_IN_MARKDOWN } from '@/globs';
import { interopDefault, parserPlain } from '@/utils';

import type {
    OptionsComponentExts,
    OptionsFiles,
    OptionsOverrides,
    TypedFlatConfigItem,
} from '@/types';

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
                'import/newline-after-import': 'off',

                'no-alert': 'off',
                'no-console': 'off',
                'no-labels': 'off',
                'no-lone-blocks': 'off',
                'no-restricted-syntax': 'off',
                'no-undef': 'off',
                'no-unused-expressions': 'off',
                'no-unused-labels': 'off',
                'no-unused-vars': 'off',

                'node/prefer-global/process': 'off',

                '@stylistic/comma-dangle': 'off',
                '@stylistic/consistent-type-imports': 'off',
                '@stylistic/eol-last': 'off',
                '@stylistic/no-namespace': 'off',
                '@stylistic/no-redeclare': 'off',
                '@stylistic/no-require-imports': 'off',
                '@stylistic/no-unused-vars': 'off',
                '@stylistic/no-use-before-define': 'off',
                '@stylistic/no-var-requires': 'off',

                'unicode-bom': 'off',
                'unused-imports/no-unused-imports': 'off',
                'unused-imports/no-unused-vars': 'off',

                // Type aware rules
                ...{
                    '@stylistic/await-thenable': 'off',
                    '@stylistic/dot-notation': 'off',
                    '@stylistic/no-floating-promises': 'off',
                    '@stylistic/no-for-in-array': 'off',
                    '@stylistic/no-implied-eval': 'off',
                    '@stylistic/no-misused-promises': 'off',
                    '@stylistic/no-throw-literal': 'off',
                    '@stylistic/no-unnecessary-type-assertion': 'off',
                    '@stylistic/no-unsafe-argument': 'off',
                    '@stylistic/no-unsafe-assignment': 'off',
                    '@stylistic/no-unsafe-call': 'off',
                    '@stylistic/no-unsafe-member-access': 'off',
                    '@stylistic/no-unsafe-return': 'off',
                    '@stylistic/restrict-plus-operands': 'off',
                    '@stylistic/restrict-template-expressions': 'off',
                    '@stylistic/unbound-method': 'off',
                },
                ...overrides,
            },
        },
    ]
}
