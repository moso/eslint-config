import { loadPackages } from '../tools';
import { flattenRules, memoize } from '../utils';

import type {
    OptionsAstro,
    OptionsFiles,
    OptionsHasTypeScript,
    OptionsLessOpinionated,
    OptionsOverrides,
    OptionsTypeScriptParserOptions,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

export const astro = async (
    options: Readonly<
        OptionsAstro &
        OptionsLessOpinionated &
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
        a11y,
        files,
        lessOpinionated,
        overrides,
        overridesA11y,
        parserOptions,
        stylistic,
        typescript,
    } = options;

    const stylisticEnabled = stylistic !== false;

    const [astroParser, astroPlugin] = await loadPackages(['astro-eslint-parser', 'eslint-plugin-astro']);

    const [jsxA11yPlugin] = a11y
        ? await loadPackages(['eslint-plugin-jsx-a11y'])
        : [undefined];

    const [typescriptParser] = typescript
        ? await loadPackages(['@typescript-eslint/parser'])
        : [undefined];

    const { projectService, ...typeAwareParserOptions } = parserOptions ?? {};

    return [
        {
            name: 'moso/astro/setup',
            plugins: {
                'astro': memoize(astroPlugin, 'eslint-plugin-astro'),
                ...jsxA11yPlugin && { 'jsx-a11y': memoize(jsxA11yPlugin, 'eslint-plugin-jsx-a11y') },
            },
        },
        {
            name: 'moso/astro/rules',
            files,
            languageOptions: {
                globals: {
                    ...astroPlugin.environments.astro.globals,
                },
                parser: memoize(astroParser, 'astro-eslint-parser'),
                parserOptions: {
                    extraFileExtensions: ['.astro'],
                    parser: typescript ? typescriptParser : undefined,
                    ...(typescript && {
                        ...typeAwareParserOptions,
                        ...(Boolean(projectService) && { project: true }),
                    }),
                },
                sourceType: 'module',
            },
            processor: 'astro/client-side-ts',
            rules: {
                // Astro uses top level await for e.g. data fetching
                // @see https://docs.astro.build/en/guides/data-fetching/#fetch-in-astro
                '@moso/no-top-level-await': 'off',
                'node/no-top-level-await': 'off',

                'unicorn/no-await-expression-member': 'off',

                ...flattenRules(astroPlugin.configs.recommended),

                ...(!lessOpinionated && {
                    'astro/no-set-html-directive': 'error',
                    'astro/no-set-text-directive': 'error',
                    'astro/no-unsafe-inline-scripts': 'error',
                    // 'astro/no-unused-css-selector': 'error', // False positives on selectors only used by imported JSX components

                    ...(stylisticEnabled && {
                        'astro/prefer-class-list-directive': 'error',
                        'astro/prefer-object-class-list': 'error',
                        'astro/prefer-split-class-list': 'error',
                        'astro/sort-attributes': 'off', // Perfectionist is already taking care of this
                    }),
                }),

                ...(stylisticEnabled && {
                    // The indent rule does not understand frontmatter fences (`---`)
                    '@stylistic/indent': 'off',
                    '@stylistic/jsx-closing-tag-location': 'off',
                    '@stylistic/jsx-one-expression-per-line': 'off',
                    '@stylistic/no-multiple-empty-lines': 'off',

                    // Extends the base ESLint's `semi` rule as it does not understand
                    // frontmatter fence tokens (`---`)
                    // @see https://ota-meshi.github.io/eslint-plugin-astro/rules/semi
                    // @see https://eslint.org/docs/latest/rules/semi
                    // 'semi': 'off', -- deprecated
                    'astro/semi': ['error', stylistic.semi ? 'always' : 'never'],
                }),

                ...(jsxA11yPlugin && {
                    ...flattenRules(astroPlugin.configs[lessOpinionated ? 'jsx-a11y-recommended' : 'jsx-a11y-strict']),

                    ...overridesA11y,
                }),

                ...overrides,
            },
        },
    ];
};
