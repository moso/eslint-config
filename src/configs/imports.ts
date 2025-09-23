import {
    GLOB_DTS,
    GLOB_TS,
    GLOB_TSX,
} from '../globs';

import mosoPlugin from '../rules';
import { loadPackages, memoize } from '../utils';

import type { ESLint } from 'eslint';

import type {
    OptionsHasTypeScript,
    OptionsOverrides,
    OptionsTypeScriptParserOptions,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

export const imports = async (
    options: Readonly<
        OptionsHasTypeScript &
        OptionsOverrides &
        OptionsTypeScriptParserOptions &
        Required<RequiredOptionsStylistic>
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        overrides,
        stylistic,
        typescript,
    } = options;

    const [importLite] = (await loadPackages(['eslint-plugin-import-lite'])) as [ESLint.Plugin];

    const stylisticEnabled = stylistic !== false;

    return [
        {
            name: 'moso/imports',
            plugins: {
                '@moso': memoize(mosoPlugin, '@moso/eslint-plugin'),
                'import-lite': memoize(importLite, 'eslint-plugin-import-lite'),
            },
            rules: {
                '@moso/no-import-duplicates': 'error',
                '@moso/no-import-from-dist': 'error',
                '@moso/no-import-node-modules-by-path': 'error',

                'import-lite/consistent-type-specifier-style': 'error',
                'import-lite/first': 'error',
                'import-lite/no-duplicates': 'error',
                'import-lite/no-mutable-exports': 'error',
                'import-lite/no-named-default': 'error',

                ...(stylisticEnabled && {
                    'import-lite/newline-after-import': ['error', { considerComments: false }],
                }),

                ...overrides,
            },
        },
        ...((typescript
            ? [
                {
                    name: 'moso/imports/typescript',
                    files: [GLOB_DTS, GLOB_TS, GLOB_TSX],
                    rules: {
                        '@typescript-eslint/no-import-type-side-effects': 'error',
                        '@typescript-eslint/consistent-type-imports': [
                            stylisticEnabled ? 'error' : 'off',
                            {
                                disallowTypeAnnotations: false,
                                fixStyle: 'inline-type-imports',
                                prefer: 'type-imports',

                            },
                        ],
                    },
                },
            ]
            : []) satisfies TypedFlatConfigItem[]
        ),
    ];
};
