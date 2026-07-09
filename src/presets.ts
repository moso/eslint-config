import path from 'node:path';

import type { OptionsConfig } from './types';

export const full: OptionsConfig = {
    astro: true,
    comments: true,
    e18e: true,
    functional: {
        functionalEnforcement: 'lite',
    },
    ignores: {
        gitignore: true,
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
    projectRoot: path.resolve(import.meta.dirname, '..'),
    promise: true,
    react: {
        reactRefresh: {
            allowConstantExport: true,
        },
    },
    regexp: true,
    stylistic: true,
    test: true,
    toml: true,
    typescript: {
        projectRoot: 'tsconfig.json',
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
    comments: false,
    e18e: false,
    functional: false,
    ignores: false,
    imports: false,
    jsdoc: false,
    jsonc: false,
    jsx: false,
    nextjs: false,
    node: false,
    perfectionist: false,
    promise: false,
    react: false,
    regexp: false,
    stylistic: false,
    test: false,
    toml: false,
    typescript: false,
    unicorn: false,
    vue: false,
    yaml: false,
};
