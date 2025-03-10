import { interopDefault } from '../utils';

import type { OptionsOverrides, TypedFlatConfigItem } from '../types';

export interface PerfectionistOptions extends OptionsOverrides {
    lessOpinionated?: boolean;
};

/**
 * Optional perfectionist plugin for props and items sorting.
 *
 * @see https://perfectionist.dev
 */
export const perfectionist = async (options: PerfectionistOptions = {}): Promise<TypedFlatConfigItem[]> => {
    const {
        lessOpinionated = false,
        overrides = {},
    } = {
        ...options,
    };

    const perfectionistPlugin = await interopDefault(import('eslint-plugin-perfectionist'));

    return [
        {
            name: 'moso/perfectionist/setup',
            plugins: {
                perfectionist: perfectionistPlugin,
            },
            rules: {
                ...(lessOpinionated
                    ? {}
                    : {
                        'perfectionist/sort-exports': ['error', { order: 'asc', type: 'natural' }],
                        'perfectionist/sort-imports': ['error', {
                            groups: [
                                'builtin',
                                'external',
                                'internal',
                                ['parent', 'sibling', 'index'],
                                'side-effect',
                                'object',
                                'unknown',
                                'builtin-type',
                                'external-type',
                                'type',
                                ['parent-type', 'sibling-type', 'index-type', 'internal-type'],
                            ],
                            newlinesBetween: 'ignore',
                            order: 'asc',
                            type: 'natural',
                        }],
                        'perfectionist/sort-named-exports': ['error', { order: 'asc', type: 'natural' }],
                        'perfectionist/sort-named-imports': ['error', { order: 'asc', type: 'natural' }],
                    }
                ),

                ...overrides,
            },
        },
    ];
};
