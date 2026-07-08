import assert from 'node:assert/strict';

import { loadPackages, memoize } from '../utils';

import type { CommonOptions, TypeOption } from '@/perfectionist-types/common-options.d.ts';

import type {
    OptionsLessOpinionated,
    OptionsPerfectionist,
    TypedFlatConfigItem,
} from '../types';

type PerfectionistOptions = Omit<CommonOptions<TypeOption>, 'alphabet'>;

const commonOptions = {
    fallbackSort: { order: 'asc', type: 'alphabetical' },
    ignoreCase: false,
    locales: 'da-DK',
    order: 'asc',
    specialCharacters: 'keep',
    type: 'natural',
} satisfies PerfectionistOptions;

export const perfectionist = async (
    options: Readonly<OptionsLessOpinionated & OptionsPerfectionist>,
): Promise<TypedFlatConfigItem[]> => {
    const { lessOpinionated, overrides } = options;

    const [perfectionistPlugin] = (await loadPackages(['eslint-plugin-perfectionist'])) as [typeof import('eslint-plugin-perfectionist')];

    return [
        {
            name: 'moso/perfectionist',
            plugins: {
                'perfectionist': memoize(perfectionistPlugin, 'eslint-plugin-perfectionist'),
            },
            rules: {
                ...(lessOpinionated
                    ? {
                        ...(assert.ok(!Array.isArray(perfectionistPlugin.configs['recommended-alphabetical'])),
                        perfectionistPlugin.configs['recommended-alphabetical'].rules),
                    }
                    : {
                        'perfectionist/sort-array-includes': [
                            'error',
                            {
                                ...commonOptions,
                                fallbackSort: { order: 'asc', type: 'natural' },
                                type: 'alphabetical',
                            },
                        ],
                        'perfectionist/sort-classes': ['error', { ...commonOptions }],
                        'perfectionist/sort-decorators': ['error', { ...commonOptions }],
                        'perfectionist/sort-enums': [
                            'error',
                            {
                                ...commonOptions,
                                groups: ['r', 'g', 'b'], // Sort colors by RGB
                                customGroups: [
                                    { elementNamePattern: '^r$', groupName: 'r' },
                                    { elementNamePattern: '^g$', groupName: 'g' },
                                    { elementNamePattern: '^b$', groupName: 'b' },
                                ],
                                useConfigurationIf: {
                                    allNamesMatchPattern: '^[rgb]$',
                                },
                            },
                            {
                                ...commonOptions,
                            },
                        ],
                        'perfectionist/sort-export-attributes': [
                            'error',
                            {
                                ...commonOptions,
                                fallbackSort: { order: 'asc', type: 'natural' },
                                type: 'alphabetical',
                            },
                        ],
                        'perfectionist/sort-exports': ['error', { ...commonOptions }],
                        'perfectionist/sort-heritage-clauses': ['error', { ...commonOptions }],
                        'perfectionist/sort-import-attributes': [
                            'error',
                            {
                                ...commonOptions,
                                fallbackSort: { order: 'asc', type: 'natural' },
                                type: 'alphabetical',
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
                                    ['type-builtin', 'type-external'],
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
                        'perfectionist/sort-interfaces': ['error', { ...commonOptions }],
                        'perfectionist/sort-intersection-types': [
                            'error',
                            {
                                ...commonOptions,
                                fallbackSort: { type: 'unsorted' },
                                groups: [
                                    ['keyword', 'literal'],
                                    'named',
                                    ['conditional', 'intersection', 'union'],
                                    'unknown',
                                ],
                                ignoreCase: true,
                                type: 'alphabetical',
                            },
                        ],
                        'perfectionist/sort-jsx-props': [
                            'error',
                            {
                                ...commonOptions,
                                ignoreCase: true,
                                type: 'unsorted',
                                useConfigurationIf: {
                                    tagMatchesPattern: '*Component$',
                                },
                            },
                            {
                                ...commonOptions,
                                ignoreCase: true,
                                type: 'unsorted',
                                useConfigurationIf: {
                                    matchesAstSelector: 'VariableDeclaration[kind="const"] JSXElement',
                                },
                            },
                            {
                                ...commonOptions,
                                fallbackSort: { order: 'asc', type: 'natural' },
                                ignoreCase: true,
                                type: 'alphabetical',
                            },
                        ],
                        'perfectionist/sort-maps': [
                            'error',
                            {
                                ...commonOptions,
                                ignoreCase: true,
                                type: 'unsorted',
                                useConfigurationIf: {
                                    matchesAstSelector: 'VariableDeclaration[kind="const"] NewExpression',
                                },
                            },
                            {
                                ...commonOptions,
                                fallbackSort: { order: 'asc', type: 'natural' },
                                ignoreCase: true,
                                type: 'alphabetical',
                            },
                        ],
                        'perfectionist/sort-modules': [
                            'error',
                            {
                                ...commonOptions,
                                fallbackSort: { type: 'unsorted' },
                                type: 'alphabetical',
                            },
                        ],
                        'perfectionist/sort-named-exports': ['error', { ...commonOptions }],
                        'perfectionist/sort-named-imports': ['error', { ...commonOptions }],
                        'perfectionist/sort-object-types': ['error', { ...commonOptions }],
                        'perfectionist/sort-objects': ['error', { ...commonOptions }],
                        'perfectionist/sort-sets': ['error', { ...commonOptions }],
                        'perfectionist/sort-switch-case': [
                            'error',
                            {
                                ...commonOptions,
                                fallbackSort: { order: 'asc', type: 'natural' },
                                type: 'alphabetical',
                            },
                        ],
                        'perfectionist/sort-union-types': [
                            'error',
                            {
                                ...commonOptions,
                                fallbackSort: { type: 'unsorted' },
                                groups: [
                                    ['keyword', 'literal'],
                                    'named',
                                    ['conditional', 'intersection', 'union'],
                                    'unknown',
                                ],
                                ignoreCase: true,
                                type: 'alphabetical',
                            },
                        ],
                        'perfectionist/sort-variable-declarations': [
                            'error',
                            {
                                ...commonOptions,
                                fallbackSort: { order: 'asc', type: 'natural' },
                                ignoreCase: true,
                                type: 'alphabetical',
                            },
                        ],
                    }
                ),

                ...overrides,
            },
        },
    ];
};
