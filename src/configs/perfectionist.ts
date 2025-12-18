import { loadPackages, memoize } from '../utils';

import type { ESLint } from 'eslint';

import type {
    OptionsLessOpinionated,
    OptionsOverrides,
    TypedFlatConfigItem,
} from '../types';

export const perfectionist = async (
    options: Readonly<OptionsLessOpinionated & OptionsOverrides>,
): Promise<TypedFlatConfigItem[]> => {
    const { lessOpinionated, overrides } = options;

    const [perfectionistPlugin] = (await loadPackages(['eslint-plugin-perfectionist'])) as [ESLint.Plugin];

    return [
        {
            name: 'moso/perfectionist',
            plugins: {
                'perfectionist': memoize(perfectionistPlugin, 'eslint-plugin-perfectionist'),
            },
            rules: {
                ...(!lessOpinionated && {
                    '@stylistic/jsx-sort-props': 'off',

                    'perfectionist/sort-array-includes': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'natural' },
                            ignoreCase: false,
                            order: 'asc',
                            type: 'alphabetical',
                        },
                    ],
                    'perfectionist/sort-classes': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            ignoreCase: false,
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-decorators': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-enums': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            ignoreCase: false,
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-exports': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            ignoreCase: false,
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-heritage-clauses': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-imports': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            groups: [
                                'builtin',
                                'external',
                                'internal',
                                ['parent', 'sibling', 'index'],
                                'side-effect',
                                'unknown',
                                'type-builtin',
                                'type-external',
                                'type-internal',
                                [
                                    'type-parent',
                                    'type-sibling',
                                    'type-index',
                                    'type-import',
                                ],
                            ],
                            ignoreCase: false,
                            newlinesBetween: 'ignore',
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-interfaces': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            // groups: [], -- WIP
                            ignoreCase: false,
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-intersection-types': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            // groups: [], -- WIP
                            ignoreCase: false,
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-jsx-props': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            ignoreCase: false,
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-maps': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            ignoreCase: false,
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-modules': [
                        'error',
                        {
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-named-exports': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            ignoreAlias: false,
                            ignoreCase: false,
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-named-imports': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            // groups: [], -- WIP
                            ignoreAlias: false,
                            ignoreCase: false,
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-object-types': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            ignoreCase: false,
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-sets': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            ignoreCase: false,
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-switch-case': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            ignoreCase: false,
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-union-types': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            // groups: [], -- WIP
                            ignoreCase: false,
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                    'perfectionist/sort-variable-declarations': [
                        'error',
                        {
                            fallbackSort: { order: 'asc', type: 'alphabetical' },
                            ignoreCase: false,
                            order: 'asc',
                            type: 'natural',
                        },
                    ],
                }),

                ...overrides,
            },
        },
    ];
};
