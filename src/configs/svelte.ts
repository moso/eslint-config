import { loadPackages } from '../tools';
import { flattenRules, memoize } from '../utils';

import type {
    OptionsFiles,
    OptionsHasTypeScript,
    OptionsLessOpinionated,
    OptionsSvelte,
    OptionsTypeScriptParserOptions,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

export const svelte = async (
    options: Readonly<
        OptionsLessOpinionated &
        OptionsSvelte &
        OptionsTypeScriptParserOptions &
        Required<
            OptionsFiles &
            OptionsHasTypeScript &
            RequiredOptionsStylistic
        >
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        files,
        lessOpinionated,
        parserOptions,
        overrides,
        stylistic,
        typescript,
    } = options;

    const { indent = 4 } = typeof stylistic === 'boolean' ? {} : stylistic;

    const stylisticEnabled = stylistic !== false;

    const [svelteParser, sveltePlugin] = await loadPackages(['svelte-eslint-parser', 'eslint-plugin-svelte']);

    const [typescriptParser] = typescript
        ? await loadPackages(['@typescript-eslint/parser'])
        : [undefined];

    return [
        {
            name: 'moso/svelte/setup',
            plugins: {
                'svelte': memoize(sveltePlugin, 'eslint-plugin-svelte'),
            },
        },
        {
            name: 'moso/svelte/rules',
            files,
            languageOptions: {
                parser: memoize(svelteParser, 'svelte-eslint-parser'),
                parserOptions: {
                    extraFileExtensions: ['.svelte'],
                    parser: typescript ? typescriptParser : undefined,
                    ...(typescript && parserOptions),
                },
            },
            processor: sveltePlugin.processors['.svelte'],
            rules: {
                'functional/no-let': 'off',
                'import-lite/no-mutable-exports': 'off',

                'no-undef': 'off',
                'no-unused-vars': typescript
                    ? 'off'
                    : [
                        'error',
                        {
                            args: 'none',
                            caughtErrors: 'none',
                            ignoreRestSiblings: true,
                            vars: 'all',
                            varsIgnorePattern: '^(\\$\\$Props$|\\$\\$Events$|\\$\\$Slots$)',
                        },
                    ],

                'unused-imports/no-unused-vars': [
                    'error',
                    {
                        args: 'after-used',
                        argsIgnorePattern: '^_',
                        ignoreRestSiblings: true,
                        vars: 'all',
                        varsIgnorePattern: '^(_|\\$\\$Props$|\\$\\$Events$|\\$\\$Slots$)',
                    },
                ],

                'prefer-const': 'off', // Superseded by svelte/prefer-const
                'svelte/prefer-const': [
                    'error',
                    {
                        destructuring: 'all',
                        ignoreReadBeforeAssign: true,
                    },
                ],

                ...flattenRules(sveltePlugin.configs.recommended),

                ...(stylisticEnabled && {
                    '@stylistic/indent': 'off', // Superseded by svelte/indent
                    '@stylistic/no-trailing-spaces': 'off', // Superseded by svelte/no-trailing-spaces

                    'svelte/derived-has-same-inputs-outputs': 'error',
                    'svelte/html-closing-bracket-spacing': 'error',
                    'svelte/html-quotes': ['error', { prefer: 'double' }],
                    'svelte/indent': [
                        'error',
                        {
                            alignAttributesVertically: true,
                            indent,
                        },
                    ],
                    'svelte/mustache-spacing': 'error',
                    'svelte/no-spaces-around-equal-signs-in-attribute': 'error',
                    'svelte/no-trailing-spaces': 'error',
                    'svelte/spaced-html-comment': 'error',
                }),

                ...(!lessOpinionated && {
                    'svelte/block-lang': ['error', { script: typescript ? 'ts' : null }],
                    'svelte/button-has-type': 'error',
                    'svelte/no-at-const-tags': 'error',
                    'svelte/no-ignored-unsubscribe': 'error',
                }),

                ...overrides,
            },
        },
        {
            name: 'moso/svelte/ignores',
            ignores: ['!**/src/lib'],
        },
    ];
};
