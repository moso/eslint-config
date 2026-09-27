import process from 'node:process';

import type { OptionsConfig } from './types';

export const full: OptionsConfig = {
    astro: {
        a11y: true,
    },
    baseline: true,
    comments: true,
    e18e: true,
    functional: {
        functionalEnforcement: 'lite',
    },
    ignores: {
        userIgnores: false,
    },
    imports: true,
    jsdoc: true,
    jsonc: true,
    jsx: {
        a11y: true,
    },
    nextjs: true,
    node: true,
    perfectionist: true,
    promise: true,
    react: {
        a11y: true,
        reactRefresh: {
            allowConstantExport: true,
        },
    },
    regexp: true,
    stylistic: true,
    tailwind: {
        entryPoint: 'src/styles/app.css',
        version: 4,
    },
    test: true,
    toml: true,
    typescript: {
        projectRoot: process.cwd(),
    },
    unicorn: true,
    vue: {
        a11y: true,
        sfcBlocks: true,
    },
    yaml: true,
};

export const off: OptionsConfig = {
    astro: false,
    baseline: false,
    comments: false,
    e18e: false,
    functional: false,
    ignores: false,
    imports: false,
    jsdoc: false,
    jsonc: false,
    jsx: false,
    lessOpinionated: true,
    nextjs: false,
    node: false,
    perfectionist: false,
    promise: false,
    react: false,
    regexp: false,
    stylistic: false,
    tailwind: false,
    test: false,
    toml: false,
    typescript: false,
    unicorn: false,
    vue: false,
    yaml: false,
};
