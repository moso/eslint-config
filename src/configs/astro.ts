import {
    ensurePackages,
    interopDefault,
    loadPackages,
    memoize,
} from '../utils';

import type { ESLint, Linter } from 'eslint';

import type {
    OptionsFiles,
    OptionsHasTypeScript,
    OptionsOverrides,
    OptionsTypeScriptParserOptions,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

export const astro = async (
    options: Readonly<
        OptionsOverrides &
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
        overrides,
        parserOptions,
        stylistic,
        typescript,
    } = options;

    await ensurePackages(['astro-eslint-parser', 'eslint-plugin-astro']);

    const stylisticEnabled = stylistic !== false;

    const typescriptParser = typescript ? (await interopDefault(import('@typescript-eslint/parser'))) : undefined;

    const [astroParser, astroPlugin] = (await loadPackages([
        'astro-eslint-parser',
        'eslint-plugin-astro',
    ])) as [Linter.Parser, ESLint.Plugin];

    return [
        {
            name: 'moso/astro/setup',
            plugins: {
                'astro': memoize(astroPlugin, 'eslint-plugin-astro'),
            },
        },
        {
            name: 'moso/astro/rules',
            files,
            languageOptions: {
                globals: {
                    ...astroPlugin.environments?.astro.globals,
                },
                parser: typescript ? typescriptParser : memoize(astroParser, 'astro-eslint-parser'),
                parserOptions: {
                    extraFileExtensions: ['.astro'],
                    ...(typescript ? parserOptions : undefined),
                },
                sourceType: 'module',
            },
            processor: 'astro/client-side-ts',
            rules: {
                // Astro uses top level await for e.g. data fetching
                // https://docs.astro.build/en/guides/data-fetching/#fetch-in-astro
                '@moso/no-top-level-await': 'off',

                // Recommended rules
                'astro/missing-client-only-directive-value': 'error',
                'astro/no-conflict-set-directives': 'error',
                'astro/no-deprecated-astro-canonicalurl': 'error',
                'astro/no-deprecated-astro-fetchcontent': 'error',
                'astro/no-deprecated-astro-resolve': 'error',
                'astro/no-deprecated-getentrybyslug': 'error',
                'astro/no-set-html-directive': 'off',
                'astro/no-unused-define-vars-in-style': 'error',
                'astro/semi': 'off',
                'astro/valid-compile': 'error',

                ...(stylisticEnabled && {
                    '@stylistic/indent': 'off',
                    '@stylistic/jsx-closing-tag-location': 'off',
                    '@stylistic/jsx-one-expression-per-line': 'off',
                    '@stylistic/no-multiple-empty-lines': 'off',
                }),

                ...overrides,
            },
        },
    ];
};
