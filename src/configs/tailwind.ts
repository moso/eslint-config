/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { loadPackages } from '../tools';
import { memoize } from '../utils';

import type { RequiredOptionsStylistic, RequiredOptionsTailwind, TypedFlatConfigItem } from '../types';

export const tailwind = async (
    options: Readonly<
        Required<RequiredOptionsStylistic & RequiredOptionsTailwind>
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        config,
        entryPoint,
        overrides,
        stylistic,
        version,
    } = options;

    const [tailwindPlugin] = (await loadPackages(['eslint-plugin-better-tailwindcss']));

    const stylisticEnabled = stylistic !== false;

    return [
        {
            name: 'moso/tailwind',
            settings: {
                'better-tailwindcss': version === 4
                    ? { entryPoint }
                    : version === 3
                        ? { config }
                        : undefined,
            },
            plugins: {
                'tailwind-better': memoize(tailwindPlugin, 'eslint-plugin-better-tailwindcss'),
            },
            rules: {
                'tailwind-better/no-conflicting-classes': 'error',
                'tailwind-better/no-restricted-classes': 'error',
                'tailwind-better/no-unknown-classes': ['off', { detectComponentClasses: true }],

                ...(stylisticEnabled && {
                    'tailwind-better/enforce-consistent-line-wrapping': [
                        'error',
                        {
                            classesPerLine: 0,
                            group: 'newLine',
                            indent: stylistic.indent,
                            lineBreakStyle: 'unix',
                            preferSingleLine: false,
                        },
                    ],
                    'tailwind-better/enforce-consistent-class-order': [
                        'error',
                        {
                            order: 'strict',
                            detectComponentClasses: true,
                            componentClassOrder: 'preserve',
                            componentClassPosition: 'start',
                            unknownClassOrder: 'preserve',
                            unknownClassPosition: 'start',
                        },
                    ],
                    'tailwind-better/enforce-consistent-variable-syntax': ['error', { syntax: 'shorthand' }],
                    'tailwind-better/enforce-consistent-important-position': 'off',
                    'tailwind-better/enforce-shorthand-classes': 'off',
                    'tailwind-better/enforce-canonical-classes': 'error',

                    'tailwind-better/no-duplicate-classes': 'error',
                    'tailwind-better/no-deprecated-classes': 'warn',
                    'tailwind-better/no-unnecessary-whitespace': 'warn',
                }),

                ...overrides,
            },
        },
    ];
};
