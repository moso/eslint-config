import { moso } from './src';

import type { Linter } from 'eslint';

/**
 * The type annotation is in place because of
 * `isolatedDeclarations` in `tsconfig.json`.
 * It is not necessary to replicate.
 */
const config: Promise<Linter.Config[]> = moso(
    {
        astro: true,
        functional: 'lite',
        ignores: {
            gitignore: true,
        },
        jsonc: true,
        mode: 'library',
        nextjs: true,
        react: true,
        stylistic: {
            experimental: true,
            indent: 4,
            jsx: true,
            quotes: 'single',
            semi: true,
        },
        toml: true,
        typescript: {
            projectRoot: import.meta.dirname,
        },
        vue: true,
        yaml: true,
    },
    {
        files: ['src/**/*.ts'],
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
        rules: {
            '@moso/avoid-barrel-files': 'off',
        },
    },
    {
        files: ['src/utils.ts'],
        rules: {
            'functional/no-throw-statements': 'off',
        },
    },
    {
        files: ['src/rules/**/*.ts'],
        rules: {
            'functional/no-loop-statements': 'off',
        },
    },
);

export default config;
