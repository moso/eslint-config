import { moso } from './src';

import type { Linter } from 'eslint';

const config: Promise<Linter.Config[]> = moso(
    {
        astro: true,
        baseline: true,
        functional: 'lite',
        jsdoc: true,
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
        tailwind: true,
        toml: true,
        typescript: {
            projectRoot: import.meta.dirname,
        },
        unicorn: true,
        vue: true,
        yaml: true,
    },
);

export default config;
