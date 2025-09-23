import { GLOB_JSX, GLOB_TSX } from '../globs';

import type { TypedFlatConfigItem } from '../types';

export const jsx = (): TypedFlatConfigItem[] => [
    {
        name: 'moso/jsx',
        files: [GLOB_JSX, GLOB_TSX],
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    },
];
