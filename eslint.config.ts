import { moso } from './src';

export default moso(
    {
        astro: true,
        functional: 'lite',
        jsdoc: true,
        jsonc: true,
        mode: 'none',
        nextjs: true,
        projectRoot: import.meta.dirname,
        react: true,
        toml: true,
        vue: true,
        yaml: true,
    },
    {
        // ignores: ['src/rules/*.ts'],
    },
    {
        files: ['src/**/*.ts'],
        rules: {
            'perfectionist/sort-exports': 'off',
        },
    },
    {
        // Used internally for this project,
        // as the project is not using nextjs and does not have a `pages` folder
        rules: {
            '@next/next/no-html-link-for-pages': 'off',
        },
    },
);
