import { moso } from './src';

import type { Linter } from 'eslint';

/**
 * The type annotation is in place because of
 * `isolatedDeclarations` in `tsconfig.json`.
 * It is not necessary to replicate.
 */
const config: Promise<Linter.Config[]> = moso(
    {
        mode: 'library',
        toml: true,
        typescript: {
            projectRoot: import.meta.dirname,
        },
    },
    {
        files: ['src/**/*.ts'],
        name: 'moso/config/disables/perfectionist-in-typescript',
        rules: {
            'perfectionist/sort-exports': 'off',
            'perfectionist/sort-objects': [
                'error',
                {
                    fallbackSort: { order: 'asc', type: 'natural' },
                    type: 'unsorted',
                },
            ],
        },
    },
    {
        files: ['src/index.ts', 'src/configs/index.ts'],
        name: 'moso/config/disables/avoid-barrel-files-in-config-indexes',
        rules: {
            '@moso/avoid-barrel-files': 'off',
        },
    },
    {
        files: ['src/utils.ts'],
        name: 'moso/config/disables/functional-no-throw-statements-in-utils',
        rules: {
            'functional/no-throw-statements': 'off',
        },
    },
    {
        files: ['src/rules/**/*.ts'],
        name: 'moso/config/disables/functional-no-loop-statements-in-custom-rules',
        rules: {
            'functional/no-loop-statements': 'off',
        },
    },
);

export default config;
